// src/components/buyer/PaymentProofUpload.tsx

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/lib/toast';

interface PaymentProofUploadProps {
  onProofsChange: (files: File[], reference: string, notes: string) => void;
  orderId: string;
  totalAmount: number;
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onProofsChange,
  orderId,
  totalAmount,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (files: FileList) => {
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.general.uploadError();
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.general.uploadError();
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const updatedFiles = [...selectedFiles, ...validFiles];
    setSelectedFiles(updatedFiles);
    onProofsChange(updatedFiles, transactionReference, notes);

 
  };

  const removeProof = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    onProofsChange(updatedFiles, transactionReference, notes);
  };

  const handleReferenceChange = (value: string) => {
    setTransactionReference(value);
    onProofsChange(selectedFiles, value, notes);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onProofsChange(selectedFiles, transactionReference, value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Payment Proof Upload
        </CardTitle>
        <CardDescription>
          Upload screenshots of your bank transfer confirmation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Transaction Reference */}
        <div className="space-y-2">
          <Label htmlFor="reference">Transaction Reference *</Label>
          <Input
            id="reference"
            placeholder="Enter your bank transfer reference number"
            value={transactionReference}
            onChange={(e) => handleReferenceChange(e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            This is the reference number from your bank transfer
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Payment Proof Images *</Label>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload payment proof images
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG up to 5MB each
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({selectedFiles.length})</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Payment proof ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeProof(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about your payment..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={3}
          />
        </div>


        {/* Validation Notice */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Payment Verification Process:</p>
              <ul className="text-xs space-y-1">
                <li>• Upload clear screenshots of your bank transfer</li>
                <li>• Include the transaction reference number</li>
                <li>• Your payment will be verified within 24 hours</li>
                <li>• You'll receive confirmation once verified</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentProofUpload;
