// bring in dependencies
const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3Inst = new Web3(ganache.provider());

// local variables
const {interface, bytecode} = require('../compile');
let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3Inst.eth.getAccounts();
    lottery = await new web3Inst.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], 
                gas: '1000000'});
});

