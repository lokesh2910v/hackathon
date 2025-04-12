import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { aptosWalletAdapter } from "@/lib/aptos";
import { Loader2, Wallet } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function WalletButton() {
  const { user, updateWalletMutation } = useAuth();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      
      // Check if wallet is already connected
      if (user?.walletAddress) {
        toast({
          title: "Wallet already connected",
          description: `Your wallet (${user.walletAddress.substring(0, 6)}...) is already connected.`,
        });
        setIsConnecting(false);
        return;
      }
      
      // Try to connect through Aptos wallet extension
      const walletInfo = await aptosWalletAdapter.connect();
      
      if (walletInfo.address) {
        // Update user's wallet address in the database
        updateWalletMutation.mutate({ walletAddress: walletInfo.address });
      } else {
        // No address returned, open manual input dialog
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      
      // Check if it's because wallet extension is not installed
      if (error.message?.includes("extension not found")) {
        setIsDialogOpen(true);
      } else {
        toast({
          title: "Failed to connect wallet",
          description: error.message || "An error occurred while connecting to your wallet.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSubmit = () => {
    if (!manualAddress) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid Aptos wallet address.",
        variant: "destructive",
      });
      return;
    }
    
    updateWalletMutation.mutate({ walletAddress: manualAddress });
    setIsDialogOpen(false);
    setManualAddress("");
  };

  return (
    <>
      <Button
        variant="default"
        className="w-full"
        onClick={connectWallet}
        disabled={isConnecting || updateWalletMutation.isPending || !!user?.walletAddress}
      >
        {isConnecting || updateWalletMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Wallet className="h-4 w-4 mr-2" />
        )}
        {user?.walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Wallet Manually</DialogTitle>
            <DialogDescription>
              It seems you don't have the Petra wallet extension installed.
              You can manually enter your Aptos wallet address below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="wallet-address">Wallet Address</Label>
              <Input
                id="wallet-address"
                placeholder="0x..."
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={handleManualSubmit}>
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
