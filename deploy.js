// get needed files
const HdWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const {interface, bytecode} = require('./compile');
require('dotenv').config();

// set up needed variables
const keyPhase = process.env.KeyPhase;
const urlForNetwork = 'https://rinkeby.infura.io/v3/b6a8231164f34b91b006dde05d5c99a7';

// set up provider for network
const provider = new HdWalletProvider(
    keyPhase, urlForNetwork
);

// use provider obj to connect to network
const web3 = new Web3(provider);

// create a deploy function to use async/await
const deploy = async function () {
    const accounts = await web3.eth.getAccounts();
    console.log(`attempting to deploy from ${accounts[0]}`);

    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: ['Hello Network']})
        .send({ gas: '1000000', from: accounts[0]});

    console.log(`Deployed to ${result.options.address}`);
};

// call deploy
deploy();