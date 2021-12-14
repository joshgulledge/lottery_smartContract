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

describe('Lottery Contract', () => {
    it('deploys to network', () => {
        assert.ok(lottery.options.address);
    });

    it('allows account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3Inst.utils.toWei('.02', 'ether')
        });

        const players = await lottery.methods.getPlayersList().call({
            from: accounts[0]
        });

        assert.equal(accounts[1], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple entries', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3Inst.utils.toWei('.2', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3Inst.utils.toWei('.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[3],
            value: web3Inst.utils.toWei('.02', 'ether')
        });

        const players = await lottery.methods.getPlayersList().call({
            from: accounts[0]
        });

        // check that all players entered are in the players array
        assert.equal(accounts[1], players[0]);
        assert.equal(accounts[2], players[1]);
        assert.equal(accounts[3], players[2]);
        assert.equal(3, players.length);
    });

    it('requires min amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });
            assert(false); // makes test fail if it gets here
        } catch (err) {
            assert(err); // if we get an error the test passes
        };
    });

    it('non-manager cannot pick winner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (err) {
            assert(err);
        }
    });

    it('end to end test', async () => {
        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3Inst.utils.toWei('2', 'ether')
        });

        const initialBalanceOne = await web3Inst.eth.getBalance(accounts[1]);

        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const finalBalanceOne = await web3Inst.eth.getBalance(accounts[1]);
        const testResult = initialBalanceOne < finalBalanceOne;

        const players = await lottery.methods.getPlayersList().call({
            from: accounts[0]
        });

        const contractEther = await web3Inst.eth.getBalance(lottery.options.address);
        
        // make sure list of players is empty and winner got ether 
        // and contract has no ether
        assert.equal(0, players.length);
        assert.equal(0, contractEther);
        assert(testResult);
    })
})