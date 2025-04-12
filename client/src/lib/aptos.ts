export type WalletInfo = {
  address?: string;
  publicKey?: string | string[];
  isConnected: boolean;
};

export class AptosWalletAdapter {
  private wallet: any;

  constructor() {
    this.wallet = null;
  }

  async connect(): Promise<WalletInfo> {
    try {
      // Check if Petra (Aptos wallet) is installed
      if (!window.aptos) {
        throw new Error("Aptos wallet extension not found. Please install Petra wallet.");
      }

      this.wallet = window.aptos;

      // Request connection to wallet
      await this.wallet.connect();
      
      // Get account details
      const account = await this.wallet.account();
      
      return {
        address: account.address,
        publicKey: account.publicKey,
        isConnected: true
      };
    } catch (error) {
      console.error("Error connecting to Aptos wallet:", error);
      
      if (error.message?.includes("User rejected the request")) {
        throw new Error("Connection request was rejected by the user.");
      }
      
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.wallet) {
        await this.wallet.disconnect();
      }
    } catch (error) {
      console.error("Error disconnecting from Aptos wallet:", error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      if (!this.wallet) {
        return false;
      }
      
      return await this.wallet.isConnected();
    } catch (error) {
      console.error("Error checking connection:", error);
      return false;
    }
  }

  async getAccountInfo(): Promise<WalletInfo | null> {
    try {
      if (!this.wallet || !(await this.wallet.isConnected())) {
        return null;
      }
      
      const account = await this.wallet.account();
      
      return {
        address: account.address,
        publicKey: account.publicKey,
        isConnected: true
      };
    } catch (error) {
      console.error("Error getting account info:", error);
      return null;
    }
  }

  getWalletName(): string {
    return "Petra Wallet";
  }
}

// Add Aptos wallet type to window object
declare global {
  interface Window {
    aptos?: any;
  }
}

// Create singleton instance
export const aptosWalletAdapter = new AptosWalletAdapter();
