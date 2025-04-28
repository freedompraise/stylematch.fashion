
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, MessageSquare } from "lucide-react";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      label: "Add Product",
      icon: <Plus className="w-4 h-4" />,
      onClick: () => console.log("Add Product clicked"),
    },
    {
      label: "View Orders",
      icon: <ShoppingCart className="w-4 h-4" />,
      onClick: () => console.log("View Orders clicked"),
    },
    {
      label: "Manage Inventory",
      icon: <Package className="w-4 h-4" />,
      onClick: () => console.log("Manage Inventory clicked"),
    },
    {
      label: "Messages",
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => console.log("Messages clicked"),
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="flex items-center gap-2"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
