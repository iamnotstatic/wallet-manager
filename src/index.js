const bip39 = require('bip39');
const hdkey = require('hdkey');
const ethUtil = require('ethereumjs-util');
const createHash = require('create-hash');
const bs58check = require('bs58check');

// Variables
const ethPath = "m/44'/60'/0'/0/"; // last param should be {account_index}
const btcPath = "m/44'/0'/0'/0/"; // last param should be {account_index}

// Methods
const generateMnemonic = () => {
  return bip39.generateMnemonic(); //generates string (mnemonic)
};

const getMasterKey = async (mnemonic) => {
  const seed = await bip39.mnemonicToSeed(mnemonic); //creates seed buffer
  return hdkey.fromMasterSeed(seed);
};

const generateEthAccounts = async (words = '', start = 0, end = 1) => {
  const mnemonic = words ? words : generateMnemonic();
  const root = await getMasterKey(mnemonic);

  const accounts = [];
  const keys = [];
  for (let index = start; index < end; index++) {
    // creates an address node
    const addrNode = root.derive(ethPath + index);
    const pubKey = ethUtil.privateToPublic(addrNode._privateKey);
    const addr = ethUtil.publicToAddress(pubKey).toString('hex');
    const address = ethUtil.toChecksumAddress('0x' + addr);
    accounts.push(address);
    keys.push('0x' + addrNode._privateKey.toString('hex'));
  }

  return [accounts, keys, mnemonic];
};

const generateBtcAccounts = async (words = '', start = 0, end = 1) => {
  const mnemonic = words ? words : generateMnemonic();
  const root = await getMasterKey(mnemonic);

  const accounts = [];
  const keys = [];
  for (let index = start; index < end; index++) {
    // creates an address node
    const addrNode = root.derive(btcPath + index);

    const step1 = addrNode._publicKey;
    const step2 = createHash('sha256').update(step1).digest();
    const step3 = createHash('rmd160').update(step2).digest();

    var step4 = Buffer.allocUnsafe(21);
    step4.writeUInt8(0x00, 0);
    step3.copy(step4, 1); //step3 now holds the extended RIPEMD160 result
    const step9 = bs58check.encode(step4);
    accounts.push(step9);
    keys.push(addrNode._privateKey.toString('hex'));
  }

  return [accounts, keys, mnemonic];
};

(async () => {
  const res = await generateEthAccounts(
    'hunt cabin exhaust margin slender reunion tilt mention suit end unveil hockey',
    0,
    10
  );
  // const res = await generateBtcAccounts("", 0, 10)
  console.log(res[0]);
  console.log(res[1]);
  console.log('Mnemonic:', res[2]);
})();
