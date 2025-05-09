import {
  Edit,
  Trash2,
  MoreHorizontal,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Product } from '@/types/ProductSchema';
import CloudinaryImage from '@/components/CloudinaryImage';

interface ProductListProps {
  products: Product[];
  onDeleteProduct: (productId: string) => void;
  onUpdatestock_quantity: (productId: string, quantity: number) => void;
}

export function ProductList({
  products,
  onDeleteProduct,
  onUpdatestock_quantity
}: ProductListProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>stock_quantity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <CloudinaryImage
                    publicId={product.images[0]}
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md object-cover"
                    alt={product.name}
                  />
                  <div className="font-medium">{product.name}</div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>${product.price.toLocaleString()}</TableCell>
              <TableCell>{product.stock_quantity} in stock_quantity</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    product.stock_quantity <= 5 && product.stock_quantity > 0
                      ? 'bg-yellow-100 text-yellow-800'
                      : product.stock_quantity === 0
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {product.stock_quantity <= 5 && product.stock_quantity > 0
                    ? 'Low stock_quantity'
                    : product.stock_quantity === 0
                    ? 'Out of stock_quantity'
                    : 'In stock_quantity'}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDeleteProduct(product.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
