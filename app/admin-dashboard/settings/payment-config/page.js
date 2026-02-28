"use client";

import { useState } from "react";
import Link from "next/link";
import AdminDashboardLayout from "@/components/admin/AdminDashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  CreditCard,
  Wallet,
  Percent,
  Banknote,
  AlertTriangle,
  CheckCircle,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export default function PaymentConfigPage() {
  const [showApiKeys, setShowApiKeys] = useState({
    esewa: false,
    khalti: false,
  });

  const [paymentMethods, setPaymentMethods] = useState({
    esewa: {
      enabled: true,
      merchantId: "EPAYTEST",
      secretKey: "••••••••••••••••",
      testMode: true,
    },
    khalti: {
      enabled: true,
      publicKey: "test_public_key_••••••••",
      secretKey: "••••••••••••••••",
      testMode: true,
    },
    bankTransfer: {
      enabled: true,
      bankName: "NIC Asia Bank",
      accountNumber: "0123456789",
      accountHolder: "Medha eClass Pvt. Ltd.",
    },
  });

  const [commissionSettings, setCommissionSettings] = useState({
    platformCommission: 30,
    instructorShare: 70,
    minimumPayout: 5000,
    payoutFrequency: "biweekly",
  });

  const [refundSettings, setRefundSettings] = useState({
    refundWindow: 7,
    maxProgressForRefund: 30,
    autoApproveUnder: 1000,
  });

  const handleSavePaymentMethods = () => {
    toast.success("Payment methods saved successfully!");
  };

  const handleSaveCommission = () => {
    toast.success("Commission settings saved successfully!");
  };

  const handleSaveRefund = () => {
    toast.success("Refund settings saved successfully!");
  };

  const togglePaymentMethod = (method) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [method]: { ...prev[method], enabled: !prev[method].enabled },
    }));
  };

  return (
    <AdminDashboardLayout>
      <div className="px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin-dashboard/settings">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg sm:text-xl font-bold">Payment Configuration</h1>
            <p className="text-sm text-muted-foreground">
              Manage payment gateways and financial settings
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Configure available payment gateways
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* eSewa */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold">eSewa</span>
                    </div>
                    <div>
                      <h4 className="font-medium">eSewa</h4>
                      <p className="text-sm text-muted-foreground">
                        Nepal's leading digital wallet
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {paymentMethods.esewa.testMode && (
                      <Badge variant="secondary">Test Mode</Badge>
                    )}
                    <Switch
                      checked={paymentMethods.esewa.enabled}
                      onCheckedChange={() => togglePaymentMethod("esewa")}
                    />
                  </div>
                </div>
                {paymentMethods.esewa.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="esewa-merchant">Merchant ID</Label>
                        <Input
                          id="esewa-merchant"
                          value={paymentMethods.esewa.merchantId}
                          onChange={(e) =>
                            setPaymentMethods({
                              ...paymentMethods,
                              esewa: { ...paymentMethods.esewa, merchantId: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="esewa-secret">Secret Key</Label>
                        <div className="relative">
                          <Input
                            id="esewa-secret"
                            type={showApiKeys.esewa ? "text" : "password"}
                            value={paymentMethods.esewa.secretKey}
                            onChange={(e) =>
                              setPaymentMethods({
                                ...paymentMethods,
                                esewa: { ...paymentMethods.esewa, secretKey: e.target.value },
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() =>
                              setShowApiKeys({ ...showApiKeys, esewa: !showApiKeys.esewa })
                            }
                          >
                            {showApiKeys.esewa ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="esewa-test"
                        checked={paymentMethods.esewa.testMode}
                        onCheckedChange={(checked) =>
                          setPaymentMethods({
                            ...paymentMethods,
                            esewa: { ...paymentMethods.esewa, testMode: checked },
                          })
                        }
                      />
                      <Label htmlFor="esewa-test">Enable Test Mode</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Khalti */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold text-sm">Khalti</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Khalti</h4>
                      <p className="text-sm text-muted-foreground">
                        Digital wallet and payment gateway
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {paymentMethods.khalti.testMode && (
                      <Badge variant="secondary">Test Mode</Badge>
                    )}
                    <Switch
                      checked={paymentMethods.khalti.enabled}
                      onCheckedChange={() => togglePaymentMethod("khalti")}
                    />
                  </div>
                </div>
                {paymentMethods.khalti.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="khalti-public">Public Key</Label>
                        <Input
                          id="khalti-public"
                          value={paymentMethods.khalti.publicKey}
                          onChange={(e) =>
                            setPaymentMethods({
                              ...paymentMethods,
                              khalti: { ...paymentMethods.khalti, publicKey: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="khalti-secret">Secret Key</Label>
                        <div className="relative">
                          <Input
                            id="khalti-secret"
                            type={showApiKeys.khalti ? "text" : "password"}
                            value={paymentMethods.khalti.secretKey}
                            onChange={(e) =>
                              setPaymentMethods({
                                ...paymentMethods,
                                khalti: { ...paymentMethods.khalti, secretKey: e.target.value },
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full"
                            onClick={() =>
                              setShowApiKeys({ ...showApiKeys, khalti: !showApiKeys.khalti })
                            }
                          >
                            {showApiKeys.khalti ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="khalti-test"
                        checked={paymentMethods.khalti.testMode}
                        onCheckedChange={(checked) =>
                          setPaymentMethods({
                            ...paymentMethods,
                            khalti: { ...paymentMethods.khalti, testMode: checked },
                          })
                        }
                      />
                      <Label htmlFor="khalti-test">Enable Test Mode</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Bank Transfer */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Bank Transfer</h4>
                      <p className="text-sm text-muted-foreground">
                        Direct bank transfer option
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={paymentMethods.bankTransfer.enabled}
                    onCheckedChange={() => togglePaymentMethod("bankTransfer")}
                  />
                </div>
                {paymentMethods.bankTransfer.enabled && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input
                          id="bank-name"
                          value={paymentMethods.bankTransfer.bankName}
                          onChange={(e) =>
                            setPaymentMethods({
                              ...paymentMethods,
                              bankTransfer: {
                                ...paymentMethods.bankTransfer,
                                bankName: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input
                          id="account-number"
                          value={paymentMethods.bankTransfer.accountNumber}
                          onChange={(e) =>
                            setPaymentMethods({
                              ...paymentMethods,
                              bankTransfer: {
                                ...paymentMethods.bankTransfer,
                                accountNumber: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-holder">Account Holder</Label>
                        <Input
                          id="account-holder"
                          value={paymentMethods.bankTransfer.accountHolder}
                          onChange={(e) =>
                            setPaymentMethods({
                              ...paymentMethods,
                              bankTransfer: {
                                ...paymentMethods.bankTransfer,
                                accountHolder: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={handleSavePaymentMethods} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Save Payment Settings
              </Button>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Commission Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Commission Settings
                </CardTitle>
                <CardDescription>
                  Configure platform commission and instructor payouts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="commission">Platform Commission (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="commission"
                      type="number"
                      min="0"
                      max="100"
                      value={commissionSettings.platformCommission}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setCommissionSettings({
                          ...commissionSettings,
                          platformCommission: value,
                          instructorShare: 100 - value,
                        });
                      }}
                      className="w-24"
                    />
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${commissionSettings.platformCommission}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Instructor receives {commissionSettings.instructorShare}% of each sale
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="min-payout">Minimum Payout Amount (Rs.)</Label>
                  <Input
                    id="min-payout"
                    type="number"
                    value={commissionSettings.minimumPayout}
                    onChange={(e) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        minimumPayout: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Instructors can request payout after reaching this amount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Payout Frequency</Label>
                  <Select
                    value={commissionSettings.payoutFrequency}
                    onValueChange={(value) =>
                      setCommissionSettings({
                        ...commissionSettings,
                        payoutFrequency: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSaveCommission} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Commission Settings
                </Button>
              </CardContent>
            </Card>

            {/* Refund Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Banknote className="h-5 w-5" />
                  Refund Policy
                </CardTitle>
                <CardDescription>
                  Configure refund eligibility and automation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="refund-window">Refund Window (Days)</Label>
                  <Input
                    id="refund-window"
                    type="number"
                    value={refundSettings.refundWindow}
                    onChange={(e) =>
                      setRefundSettings({
                        ...refundSettings,
                        refundWindow: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Users can request refund within this many days of purchase
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-progress">Maximum Course Progress (%)</Label>
                  <Input
                    id="max-progress"
                    type="number"
                    max="100"
                    value={refundSettings.maxProgressForRefund}
                    onChange={(e) =>
                      setRefundSettings({
                        ...refundSettings,
                        maxProgressForRefund: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Refunds not allowed if course progress exceeds this
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="auto-approve">Auto-Approve Threshold (Rs.)</Label>
                  <Input
                    id="auto-approve"
                    type="number"
                    value={refundSettings.autoApproveUnder}
                    onChange={(e) =>
                      setRefundSettings({
                        ...refundSettings,
                        autoApproveUnder: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Refunds under this amount are auto-approved (set to 0 to disable)
                  </p>
                </div>

                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-orange-700">
                    Auto-approved refunds are processed immediately without admin review
                  </p>
                </div>

                <Button onClick={handleSaveRefund} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Refund Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
