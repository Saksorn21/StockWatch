import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SubPortfolio } from "../../types/stock";

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (portfolio: Omit<SubPortfolio, "id" | "createdAt">) => void;
}

export function CreatePortfolioModal({ isOpen, onClose, onCreate }: CreatePortfolioModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAllocation, setTargetAllocation] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
        targetAllocation,
      });
      
      // Reset form
      setName("");
      setDescription("");
      setTargetAllocation(0);
      onClose();
    } catch (error) {
      console.error("Error creating portfolio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setTargetAllocation(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Portfolio</DialogTitle>
          <DialogDescription>
            Create a new sub-portfolio to organize your investments.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">Portfolio Name *</Label>
            <Input
              id="portfolio-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tech Stocks, Dividend Portfolio"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-description">Description (Optional)</Label>
            <Textarea
              id="portfolio-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this portfolio's investment strategy"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="target-allocation">Target Allocation (%)</Label>
            <Input
              id="target-allocation"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={targetAllocation}
              onChange={(e) => setTargetAllocation(parseFloat(e.target.value) || 0)}
              placeholder="e.g. 25.5"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? "Creating..." : "Create Portfolio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}