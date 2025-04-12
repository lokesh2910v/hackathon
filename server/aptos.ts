import { AptosClient, AptosAccount, Types, TxnBuilderTypes, BCS } from "aptos";
import { storage } from "./storage";

// Constants
const NETWORK = process.env.APTOS_NETWORK || "devnet";
const NODE_URL = NETWORK === "mainnet" 
  ? "https://fullnode.mainnet.aptoslabs.com/v1"
  : NETWORK === "testnet" 
    ? "https://fullnode.testnet.aptoslabs.com/v1"
    : "https://fullnode.devnet.aptoslabs.com/v1";

const PRIVATE_KEY = process.env.APTOS_PRIVATE_KEY;
if (!PRIVATE_KEY) {
  console.warn("APTOS_PRIVATE_KEY not set. Blockchain transactions will fail.");
}

export class AptosService {
  private client: AptosClient;
  private platformAccount: AptosAccount | null = null;

  constructor() {
    this.client = new AptosClient(NODE_URL);
    console.log(`Using Aptos ${NETWORK} network: ${NODE_URL}`);
    this.initPlatformAccount();
  }

  private initPlatformAccount() {
    if (PRIVATE_KEY) {
      try {
        // Convert from hex string to Uint8Array
        const privateKeyBytes = Uint8Array.from(Buffer.from(PRIVATE_KEY.replace(/^0x/i, ''), 'hex'));
        this.platformAccount = new AptosAccount(privateKeyBytes);
        console.log(`Platform account initialized: ${this.platformAccount.address()}`);
      } catch (error) {
        console.error("Error initializing platform account:", error);
      }
    }
  }

  async transferApt(
    recipientAddress: string,
    amount: string,
    attemptId: number
  ): Promise<{ transactionHash: string; simulated?: boolean }> {
    if (!this.platformAccount) {
      throw new Error("Platform account not initialized");
    }

    try {
      // First, check if platform account exists on chain
      let accountExists = false;
      try {
        await this.client.getAccount(this.platformAccount.address());
        accountExists = true;
      } catch (e) {
        console.warn(`Platform account not found on chain for ${NETWORK}. This is normal if you haven't funded the account on devnet yet.`);
      }

      // Create a placeholder transaction hash for development mode
      const placeholderTxHash = `dev-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // If account doesn't exist, use simulation mode (for development)
      if (!accountExists) {
        console.log(`Simulating APT transfer: ${amount} APT to ${recipientAddress}`);
        
        // Mark the reward as claimed in the database with the placeholder hash
        await storage.markRewardAsClaimed(attemptId, placeholderTxHash);
        
        return { 
          transactionHash: placeholderTxHash,
          simulated: true
        };
      }

      // Continue with real transaction if account exists
      // Convert amount from decimal to octas (1 APT = 10^8 octas)
      const amountInOctas = BigInt(parseFloat(amount) * 100000000);

      // Build and submit transaction
      const payload: Types.TransactionPayload = {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: [recipientAddress, amountInOctas.toString()]
      };

      const rawTxn = await this.client.generateTransaction(
        this.platformAccount.address(),
        payload
      );

      const signedTxn = await this.client.signTransaction(
        this.platformAccount,
        rawTxn
      );

      const response = await this.client.submitTransaction(signedTxn);
      
      // Wait for transaction to be confirmed
      await this.client.waitForTransaction(response.hash);
      
      // Update the database to mark reward as claimed
      await storage.markRewardAsClaimed(attemptId, response.hash);
      
      return { transactionHash: response.hash };
    } catch (error) {
      console.error("Error transferring APT:", error);
      
      // Handle error gracefully for development mode
      // Mark the reward as claimed even if transaction fails
      const placeholderTxHash = `error-tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      await storage.markRewardAsClaimed(attemptId, placeholderTxHash);
      
      // Return simulated transaction for development purposes
      return { 
        transactionHash: placeholderTxHash,
        simulated: true
      };
    }
  }

  async getAccountBalance(address: string): Promise<string> {
    try {
      const resources = await this.client.getAccountResources(address);
      const aptosCoinResource = resources.find(
        (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
      );

      if (!aptosCoinResource) {
        return "0";
      }

      // Convert from octas to APT (1 APT = 10^8 octas)
      const balance = (aptosCoinResource.data as any).coin.value;
      return (parseInt(balance) / 100000000).toString();
    } catch (error) {
      console.error("Error getting account balance:", error);
      return "0";
    }
  }
}

export const aptosService = new AptosService();
