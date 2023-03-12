import * as mongodb from "mongodb";

export let db: mongodb.Db;
export let dbClient: mongodb.MongoClient;

export let wallet_db: mongodb.Db;
export let wallet_dbClient: mongodb.MongoClient;

const CAFile = "./DigitalOcean-db-ca-certificate.crt";

const dbConfig = "mongodb://mani:QzKgj9WoUrHmCCnh@20.87.215.117:27017/";
const wallet_dbConfig = "mongodb+srv://mani:605r2lSMNH1Yp987@db-mongodb-nyc1-33456-103c8813.mongo.ondigitalocean.com/admin?authSource=admin&replicaSet=db-mongodb-nyc1-33456&tls=true&tlsCAFile="+CAFile;

const connectDB = async () => {
  return new Promise(function (resolve) {
    mongodb.MongoClient.connect(
      dbConfig,

      function (err, database) {
        if (err) {
          console.log(err);
          process.exit(1);
        }

        // Save database object from the callback for reuse.
        dbClient = database;
        db = database.db("mainuserdata");
        resolve(db);
        console.log("MainUserData Database connection ready");
        return;
      },
    );
  });
};

const connectWalletDB = async () => {
  return new Promise(function (resolve) {
    mongodb.MongoClient.connect(
      wallet_dbConfig,

      function (err, database) {
        if (err) {
          console.log(err);
          process.exit(1);
        }

        // Save database object from the callback for reuse.
        wallet_dbClient = database;
        wallet_db = database.db("exchange_wallets");
        resolve(wallet_db);
        console.log("Exchange Wallets Database connection ready");
        return;
      },
    );
  });
};

export const StartUpCon = async () => {
  return new Promise(async (resolve) => {
    await connectDB();

    await connectWalletDB();

    module.exports = { db, wallet_db };

    return resolve(true);
  });
};
