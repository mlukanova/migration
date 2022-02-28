import { getFileContent } from "./utils/readFile.js"

// Add genesis accounts 
const baseAccountStructure = {
  '@type': '/cosmos.auth.v1beta1.BaseAccount',
  address: '',
  pub_key: null,
  account_number: '0',
  sequence: '0'
}

const baseBalanceStructure = {
  address: '',
  coins: [
    {
      denom: 'acudos',
      amount: '1'
    }
  ]
}
// This is the gentx
const gen_txsBaseStructure = {
  "body": {
    "messages": [
      {
        "@type": "/cosmos.staking.v1beta1.MsgCreateValidator",
        "description": {
          "moniker": "cudos-root-node",
          "identity": "",
          "website": "",
          "security_contact": "",
          "details": ""
        },
        "commission": {
          "rate": "0.100000000000000000",
          "max_rate": "0.200000000000000000",
          "max_change_rate": "0.010000000000000000"
        },
        "min_self_delegation": "2000000000000000000000000",
        "delegator_address": "cudos1et4uyn3t0dh0c4apverculst705qshv4nwyzmy",
        "validator_address": "cudosvaloper1et4uyn3t0dh0c4apverculst705qshv4wa2r6e",
        "pubkey": {
          "@type": "/cosmos.crypto.ed25519.PubKey",
          "key": "s0l/FOVAc0oJ7BO3ybRyqZnXFYillkOIAfjXC05c52s="
        },
        "value": {
          "denom": "acudos",
          "amount": "2000000000000000000000000"
        }
      },
      {
        "@type": "/gravity.v1.MsgSetOrchestratorAddress",
        "validator": "cudosvaloper1et4uyn3t0dh0c4apverculst705qshv4wa2r6e",
        "orchestrator": "cudos1e974v64yp9jld8jz85ln32q4v9rj50ztn9x76r",
        "eth_address": "0x3F6CBa492B83917B366Af3F96FdEC80328A643C4"
      }
    ],
    "memo": "35fdd2c70a85b9111017ea4e11b421461c67585a@192.168.1.236:26656",
    "timeout_height": "0",
    "extension_options": [],
    "non_critical_extension_options": []
  },
  "auth_info": {
    "signer_infos": [
      {
        "public_key": {
          "@type": "/cosmos.crypto.secp256k1.PubKey",
          "key": "A5FeTs+A/tL8BLx0fIq4gHrS3c7xHUZMxw/i4ChUoKN7"
        },
        "mode_info": {
          "single": {
            "mode": "SIGN_MODE_DIRECT"
          }
        },
        "sequence": "0"
      }
    ],
    "fee": {
      "amount": [],
      "gas_limit": "200000",
      "payer": "",
      "granter": ""
    }
  },
  "signatures": [
    "miPNd7bvDIOpBuePI09dWAvurbbnfw44urmZ+kdgQ5t8Rnpt+c1zO8RRsXiM4HxCTAhCHQ2U7iV0aGQKRB45iQ=="
  ]
}
// Validator powers
const votingPowerStructure = {

}
// static validators

const delegatorStarting = {
  "delegator_address": "",
  "starting_info": {
    "height": "0",
    "previous_period": "1",
    "stake": ""
  },
  "validator_address": ""
}

const delegations = {
  "delegator_address": "",
  "shares": "",
  "validator_address": ""
}

const signing_infos = {
  "address": "",
  "validator_signing_info": {
    "address": "",
    "index_offset": "0",
    "jailed_until": "1970-01-01T00:00:00Z",
    "missed_blocks_counter": "0",
    "start_height": "0",
    "tombstoned": false
  }
}

const validator_accumulated_commissions = {
  "accumulated": {
    "commission": [
      {
        "amount": "0",
        "denom": "acudos"
      }
    ]
  },
  "validator_address": ""
}

const validator_historical_rewards = {
  "period": "1",
  "rewards": {
    "cumulative_reward_ratio": [],
    "reference_count": 1
  },
  "validator_address": ""
}

const delegator_starting_infos = {
  "delegator_address": "",
  "starting_info": {
    "height": "0",
    "previous_period": "1",
    "stake": ""
  },
  "validator_address": ""
}


export async function generateValidatorData(gentx, stakingInfo) {

  let initialGenesis = await getFileContent('./init-genesis.json');

  // console.log(initialGenesis)
  let appState = initialGenesis.app_state
  Object.keys(stakingInfo).map(validator => {
    //not defined for validators with no delegators
    findGentx(stakingInfo[validator], gentx)
  })

  /**
   * auth.accounts
   * bank.balances
   * bank.supply
   * distribution
   * staking
   * distribution.delegator_starting_infos
   * distribution.validator_current_rewards
   * distribution.validator_historical_rewards
   * distribution.validator_accumulated_commissions
   * slashing.signing_infos 
   */


  return ""
}


function findGentx(stake, gentx) {

  //gen validator 

  if(stake.delegations) {
    
  }
  gentx.forEach(validator => {
    // get validator message
   let message = validator.body.messages[0]

    if (message.delegator_address === cudosAddress) {
      return gentx
    }
  });
}