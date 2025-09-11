// src/components/buyer/PaymentProofUpload.tsx

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { uploadPaymentProof } from '@/lib/cloudinary';

interface PaymentProofUploadProps {
  onProofsChange: (proofs: string[], reference: string, notes: string) => void;
  orderId: string;
  totalAmount: number;
}

const PaymentProofUpload: React.FC<PaymentProofUploadProps> = ({
  onProofsChange,
  orderId,
  totalAmount,
}) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [proofUrls, setProofUrls] = useState<string[]>([]);
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload only image files (JPG, PNG, etc.)',
          variant: 'destructive',
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'File too large',
          description: 'Please upload images smaller than 5MB',
          variant: 'destructive',
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const url = await uploadPaymentProof(file, orderId);
        return url;
      });

      const newUrls = await Promise.all(uploadPromises);
      const updatedUrls = [...proofUrls, ...newUrls];
      setProofUrls(updatedUrls);
      onProofsChange(updatedUrls, transactionReference, notes);

      toast({
        title: 'Upload successful',
        description: `${newUrls.length} payment proof(s) uploaded`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload payment proof. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeProof = (index: number) => {
    const updatedUrls = proofUrls.filter((_, i) => i !== index);
    setProofUrls(updatedUrls);
    onProofsChange(updatedUrls, transactionReference, notes);
  };

  const handleReferenceChange = (value: string) => {
    setTransactionReference(value);
    onProofsChange(proofUrls, value, notes);
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    onProofsChange(proofUrls, transactionReference, value);
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

        {/* Uploaded Images Preview */}
        {proofUrls.length > 0 && (
          <div className="space-y-2">
            <Label>Uploaded Proofs ({proofUrls.length})</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {proofUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
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

        {/* Upload Status */}
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Uploading payment proof...
          </div>
        )}

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
