import fetch from 'node-fetch';

const STAKING_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/rdpnd/cudo-graph'
const MAPPING_ENDPOINT = 'https://api.thegraph.com/subgraphs/name/mlukanova/mapper'
function serviceProviderQuery(first, skip) {
    return `{
  serviceProviders(first: ${first}, skip: ${skip}) {
    isServiceProviderActive
    exited
    serviceProviderManager
    serviceProviderBond

  }
}
`
}

function delegationsQuery(first, skip) {
    return `{
  delegations(first: ${first}, skip: ${skip}) {    
    delegator
    delegatedStake
    lastDelegationTxHash
  }
}
`
}

function mappingQuery(first) {
    return `{
        exampleEntities(first: ${first}) {
          ethAddress
          cudosAddress
        }
      }
      `
}



async function serviceProviders() {
    let serviceProviders = [];
    let hasMorePages = true;
    let first = 100;
    let skip = 0;
    while (hasMorePages) {
        const query = serviceProviderQuery(first, skip)
        const rawData = await fetch(STAKING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query
            })
        })
        const json = (await rawData.json()).data.serviceProviders;
        json.forEach(serviceProvider => {
            if (!serviceProvider.isServiceProviderActive || serviceProvider.exited) {
                console.debug(`Skipping service provider ${serviceProvider} because it is not active`)
            }
            serviceProviders.push({ accountId: serviceProvider.serviceProviderManager, tokens: serviceProvider.serviceProviderBond })
        })
        if (json.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    return serviceProviders
}


async function delegations() {
    let delegations = {};
    let hasMorePages = true;
    let first = 100;
    let skip = 0;
    while (hasMorePages) {
        const query = delegationsQuery(first, skip);
        const rawData = await fetch(STAKING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query
            })
        });
        const json = (await rawData.json()).data.delegations;
        json.forEach(delegation => {
            if (!delegations[delegation.delegator]) {
                delegations[delegation.delegator] = { accountId: delegation.delegator, tokens: delegation.delegatedStake, lastDelegationTxHash: delegation.lastDelegationTxHash };
            } else {
                let tokens = BigInt(delegation.delegatedStake) + BigInt(delegations[delegation.delegator].tokens);
                delegations[delegation.delegator].tokens = tokens.toString();
            }
        })
        if (json.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    return delegations
}

async function computeData() {
    const sp = await serviceProviders();
    const delegators = await delegations();
    const mapps = await getMappings();
    console.log(sp)
    console.log(delegators)
    sp.forEach(serviceProvider => {
        if (delegators[serviceProvider.accountId]) {
            let tokens = BigInt(serviceProvider.tokens) + BigInt(delegators[serviceProvider.accountId].tokens);
            serviceProvider.tokens = tokens.toString();
            serviceProvider.lastDelegationTxHash = delegators[serviceProvider.accountId].lastDelegationTxHash;
            delete delegators[serviceProvider.accountId];
        }
    })
    // mapps.forEach(map => {

    // })
    return { serviceProviders: sp, delegators: Object.values(delegators) }
}

async function getMappings() {
    let mappings = {};
    let hasMorePages = true;
    let first = 100;
    let skip = 0;
    while (hasMorePages) {
        const query = mappingQuery(first, skip);
        const rawData = await fetch(MAPPING_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query
            })
        });
        const json = (await rawData.json()).data.exampleEntities;
        json.forEach(mapping => {
            mappings[mapping.ethAddress] = { address: mapping.cudosAddress }
        })
        if (json.length < first) {
            hasMorePages = false;
        } else {
            skip += first;
        }
    }
    return mappings
}

computeData().then(data => {
    console.log(data) 
});
