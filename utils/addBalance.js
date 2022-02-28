export function addBalance(stake) {
    // Add formula later
    const apr = 20.388 / 100
    // get when contract was stopped and calculate days. 1 for now
    const daysPassed = 15
    let balancesStake = {
        bank: {}
    }
    let validatorInitialBalance
    Object.keys(stake).map(validatorKey => {
        let validator = stake[validatorKey]
        let validatorAddress = validator.address
        balancesStake[validatorAddress] = Object.assign({}, validator)
        validatorInitialBalance = (validator.tokens * apr * daysPassed) / 365

        if (Array.isArray(validator.delegation)) {

            let validatorFee = validator.fee
            let delegations = validator.delegation
            delegations.map(delegator => {
                // get rate per day

                let delegatorReward = (delegator.delegation * apr * daysPassed) / 365
                let validatorCommision = delegatorReward * validatorFee / 10000
                let delegatorBalance = delegatorReward - validatorCommision

                let validatorBalance = validatorInitialBalance + validatorCommision
                balancesStake.bank[delegator.delegatorAddress] = balancesStake.bank[delegator.delegatorAddress] ? BigInt(balancesStake.bank[delegator.delegatorAddress]) + BigInt(delegatorBalance) : delegatorBalance
                balancesStake.bank[validatorAddress] = balancesStake.bank[validatorAddress] ? BigInt(balancesStake.bank[validatorAddress]) + BigInt(validatorBalance) : BigInt(validatorBalance)
            })
        }

    })
    return balancesStake
}