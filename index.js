import fs from 'fs'
import { getFileContent } from './utils/readFile.js'
import { mappings, delegations, serviceProviders } from './utils/getGraphInfo.js'
import { getGentx } from './utils/readDir.js'
import { generateValidatorData } from './genesis.js'
import { addBalance } from './utils/addBalance.js'


BigInt.prototype.toJSON = function () { return this.toString() }

async function computeData() {
    try {
        let staticValidators, validatorNames = {}, mappedValidators = {}, cudosValidators = [], mapps, cudosAddresses = {}

        // if the run is not for the dress reharsal or test run we need to get all the info from the mapping contract
        if (process.env.NODE_ENV !== 'test') {
            staticValidators = await getFileContent('./data/validators.json')
            // get cudos validators 
            cudosValidators = staticValidators.cudos.map(add => add.toLocaleLowerCase())
            delete staticValidators.cudos

            // get all mapped addresses from the smart contract
            mapps = await mappings()

            //output raw mapping data
            await fs.writeFile('./output/mappings.json', JSON.stringify(mapps), () => { })


        } else {
            // get the mappings from the predefined accounts
            mapps = await getFileContent('./data/predefinedAddresses.json')
            cudosValidators = mapps.cudos
            delete mapps.cudos
        }

        const sp = await serviceProviders();

        // output raw service providers data
        await fs.writeFile('./output/raw/serviceProvides.json', JSON.stringify(sp), () => { })

        sp.map(validator => {
            let validatorKey = validator.accountId.toLocaleLowerCase()

            if (mapps[validatorKey.toLocaleLowerCase()] || cudosValidators.includes(validatorKey.toLocaleLowerCase())) {

                // get the mainnet validator names if possible
                if (staticValidators) { validatorNames[validatorKey] = staticValidators[validatorKey] ? staticValidators[validatorKey] : "no name" }

                // create base structure for the delegations data
                mappedValidators[validator.spId] = { id: validatorKey, tokens: validator.tokens, address: mapps[validator.accountId.toLocaleLowerCase()], fee: validator.fee }

                if (cudosValidators.includes(validatorKey.toLocaleLowerCase())) {
                    console.log('CUDOS VALIDATOR Included', validator.spId, mappedValidators[validator.spId])
                    mappedValidators[validator.spId].cudos = true
                    mappedValidators[validator.spId].address = staticValidators[validatorKey]
                }
            }
        })

        // write all mapped validators with names
        await fs.writeFile('./output/mappedValidatorsNames.json', JSON.stringify(validatorNames), () => { })
        let allValidators = Object.keys(mappedValidators)

        const delegators = await delegations();
        await fs.writeFile("./output/raw/delegations.json", JSON.stringify(delegators), () => { })
        let mappedDelegators = []
        let notMapped = []
        delegators.map(delegation => {
            // ignore 0 delegation
            if (delegation.delegatedStake !== "0") {
                if (mapps[delegation.delegator.toLocaleLowerCase()]) {
                    mappedDelegators.push(delegation)
                } else {
                    notMapped.push(delegation)
                }
            }

        })

        console.log('Delegators unmapped', notMapped.length)
        await fs.writeFile('./output/raw/unmappedDelegators.json', JSON.stringify(notMapped), () => { })
        console.log('Mapped', mappedDelegators.length)

        let found = [], notFound = []

        let totalStake = { totalStake: '' }

        // Total delegations per SP 
        delegators.map(delegation => {
            totalStake.totalStake = totalStake[delegation.serviceProvider] ? BigInt(totalStake[delegation.serviceProvider]) + BigInt(delegation.delegatedStake) : BigInt(delegation.delegatedStake)
        })

        await fs.writeFile("./output/totalSPStake.json", JSON.stringify(totalStake), () => { })

        mappedDelegators.map(delegation => {
            let validatorAddress, spAddress = delegation.serviceProvider

            if (delegation.delegatedStake < 1) {
                console.log(`Delegator stake is ${delegation.delegatedStake} for ${delegation.delegator}`)
                return
            }

            //check if the validator is in the mapped validators
            if (allValidators.indexOf(spAddress) < 0) {
                // Add all mapped delegators stake to the cudos validator d
                validatorAddress = cudosValidators[0]
                spAddress = "0x3cb8c9eef91740aac51f6ea073e718a885b4e531"

                notFound.push(delegation)
            }


            if (!Array.isArray(mappedValidators[spAddress].delegation)) {
                mappedValidators[spAddress].delegation = []
            }
            mappedValidators[spAddress].delegation.push({ delegator: delegation.delegator, delegation: delegation.delegatedStake, delegatorAddress: mapps[delegation.delegator] })
            found.push(delegation)


        })

        console.log('Redelegated', notFound.length)
        await fs.writeFile('./output/remapped.json', JSON.stringify(notFound), () => { })


        //get up to date validators from submited gentx
        if (process.env.NODE_ENV !== 'test') {
            // const gentx = await getGentx()
            // filter only validators that submitted genesises
        }
        // write stake data
        await fs.writeFile('./output/stake.json', JSON.stringify(mappedValidators), () => { })

        // calculate account balances
        let balance = addBalance(mappedValidators)
        await fs.writeFile('./output/final.json', JSON.stringify(balance), () => { })

        // await generateValidatorData(gentx, mappedValidators, "")
        // add balances
    } catch (error) {
        console.log(error)
    }
}


computeData().then(data => { });
