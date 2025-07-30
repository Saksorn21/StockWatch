import { useState } from "react";
import { Plus, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SubPortfolio } from "../../types/stock";
import { CreatePortfolioModal } from "./create-portfolio-modal";

interface PortfolioSelectorProps {
  subPortfolios: SubPortfolio[];
  currentPortfolioId: string | null;
  onSelectPortfolio: (id: string | null) => void;
  onCreatePortfolio: (portfolio: Omit<SubPortfolio, "id" | "createdAt">) => void;
  onDeletePortfolio: (id: string) => void;
}

export function PortfolioSelector({ 
  subPortfolios, 
  currentPortfolioId, 
  onSelectPortfolio, 
  onCreatePortfolio,
  onDeletePortfolio 
}: PortfolioSelectorProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentPortfolio = subPortfolios.find(p => p.id === currentPortfolioId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Portfolio Manager</h3>
          <p className="text-sm text-gray-600">Select or create a sub-portfolio to manage your investments</p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          size="sm"
          className="bg-primary hover:bg-primary-dark text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Portfolio
        </Button>
      </div>

      {subPortfolios.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolios</h3>
          <p className="mt-1 text-sm text-gray-500">
            Create your first sub-portfolio to start tracking stocks
          </p>
          <div className="mt-6">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Portfolio
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Select 
              value={currentPortfolioId || ""} 
              onValueChange={(value) => onSelectPortfolio(value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a portfolio to view stocks" />
              </SelectTrigger>
              <SelectContent>
                {subPortfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    <div>
                      <div className="font-medium">{portfolio.name}</div>
                      {portfolio.description && (
                        <div className="text-sm text-gray-500">{portfolio.description}</div>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {currentPortfolio && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Portfolio</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{currentPortfolio.name}"? This will remove all stocks in this portfolio. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDeletePortfolio(currentPortfolio.id)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Portfolio
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      )}

      <CreatePortfolioModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={onCreatePortfolio}
      />
    </div>
  );
}