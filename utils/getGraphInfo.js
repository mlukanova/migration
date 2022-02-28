import axios from 'axios'
import fs from 'fs'

const url = 'https://api.studio.thegraph.com/query/4247/cudos-wallet/v0.0.2' //mainnet
// const url = 'https://api.thegraph.com/subgraphs/name/rdpnd/cudo-graph'

// const mappingUrl = 'https://api.thegraph.com/subgraphs/name/mlukanova/mapper'
const mappingUrl = 'https://api.thegraph.com/subgraphs/name/mlukanova/address-mapper' //mainnet



function serviceProviderQuery(first, skip) {
    return `{
    serviceProviders(first: ${first}, skip: ${skip}) {
    id
    isServiceProviderActive
    exited
    serviceProviderManager
    serviceProviderBond
    rewardsFeePercentage
  }
}
`}

function delegationsQuery(first, skip) {
    return `{
    delegations(first: ${first}, skip: ${skip}) {    
    delegator
    serviceProvider
    delegatedStake
    lastDelegationTxHash
  }
}
`
}

function mappingQuery(first, skip) {
    return `{
        exampleEntities(first: ${first}) {
          ethAddress
          cudosAddress
        }
      }`
}


export async function mappings() {
    let mappings = {};
    let hasMorePages = true;
    let first = 1000;
    let skip = 0;
    while (hasMorePages) {
        const query = mappingQuery(first, skip)
        const rawData = await axios.post(mappingUrl, { query })
        const { exampleEntities: maps } = rawData.data.data

        maps.forEach(mapping => {
            mappings[mapping.ethAddress] = mapping.cudosAddress
        })
        if (maps.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    return mappings
}

export async function serviceProviders() {
    let serviceProviders = [];
    let hasMorePages = true;
    let first = 100;
    let skip = 0;
    let exited = []
    while (hasMorePages) {
        const query = serviceProviderQuery(first, skip)
        const rawData = await axios.post(url, { query })
        const { serviceProviders: provides } = rawData.data.data

        provides.forEach(serviceProvider => {
            if (!serviceProvider.isServiceProviderActive || serviceProvider.exited) {
                exited.push(serviceProvider)
            }
            serviceProviders.push({ accountId: serviceProvider.serviceProviderManager, tokens: serviceProvider.serviceProviderBond, spId: serviceProvider.id, fee: serviceProvider.rewardsFeePercentage })
        })
        if (provides.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    await fs.writeFile('./output/raw/exitedSP.json', JSON.stringify(exited), () => { })

    return serviceProviders
}


export async function delegations() {
    let hasMorePages = true;
    let delegations = {};
    let first = 1000;
    let skip = 0;
    while (hasMorePages) {
        const query = delegationsQuery(first, skip);
        const rawData = await axios.post(url, { query });
        delegations = rawData.data.data.delegations;
        if (delegations.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    return delegations
}
