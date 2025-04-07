import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, AlertTriangle, Info } from "lucide-react";

interface Settings {
  maintenance: {
    enabled: boolean;
    message: string;
  };
  notifications: {
    emailOnRegistration: boolean;
    emailOnDeposit: boolean;
    emailOnWithdrawal: boolean;
  };
  game: {
    minBetAmount: number;
    maxBetAmount: number;
    coinTossMultiplier: number;
    sattaMatkaMultiplier: number;
  };
  platform: {
    siteName: string;
    supportEmail: string;
    supportPhone: string;
    demoMode: boolean;
  };
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch settings
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ["/api/admin/settings"],
    retry: false,
  });
  
  // Initialize form data with settings or default values
  const [generalSettings, setGeneralSettings] = useState({
    siteName: settings?.platform.siteName || "StakePlay",
    supportEmail: settings?.platform.supportEmail || "support@stakeplay.com",
    supportPhone: settings?.platform.supportPhone || "",
    demoMode: settings?.platform.demoMode || false,
    maintenance: settings?.maintenance.enabled || false,
    maintenanceMessage: settings?.maintenance.message || "Site is under maintenance. Please check back later.",
  });
  
  const [gameSettings, setGameSettings] = useState({
    minBetAmount: settings?.game.minBetAmount || 10,
    maxBetAmount: settings?.game.maxBetAmount || 10000,
    coinTossMultiplier: settings?.game.coinTossMultiplier || 1.9,
    sattaMatkaMultiplier: settings?.game.sattaMatkaMultiplier || 7.5,
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnRegistration: settings?.notifications.emailOnRegistration || true,
    emailOnDeposit: settings?.notifications.emailOnDeposit || true,
    emailOnWithdrawal: settings?.notifications.emailOnWithdrawal || true,
  });
  
  // Update form data when settings are loaded
  useState(() => {
    if (settings) {
      setGeneralSettings({
        siteName: settings.platform.siteName,
        supportEmail: settings.platform.supportEmail,
        supportPhone: settings.platform.supportPhone || "",
        demoMode: settings.platform.demoMode,
        maintenance: settings.maintenance.enabled,
        maintenanceMessage: settings.maintenance.message,
      });
      
      setGameSettings({
        minBetAmount: settings.game.minBetAmount,
        maxBetAmount: settings.game.maxBetAmount,
        coinTossMultiplier: settings.game.coinTossMultiplier,
        sattaMatkaMultiplier: settings.game.sattaMatkaMultiplier,
      });
      
      setNotificationSettings({
        emailOnRegistration: settings.notifications.emailOnRegistration,
        emailOnDeposit: settings.notifications.emailOnDeposit,
        emailOnWithdrawal: settings.notifications.emailOnWithdrawal,
      });
    }
  }, [settings]);
  
  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: Partial<Settings>) => {
      const res = await apiRequest("PATCH", "/api/admin/settings", settingsData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({
        title: "Settings updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle save general settings
  const handleSaveGeneralSettings = () => {
    updateSettingsMutation.mutate({
      platform: {
        siteName: generalSettings.siteName,
        supportEmail: generalSettings.supportEmail,
        supportPhone: generalSettings.supportPhone,
        demoMode: generalSettings.demoMode,
      },
      maintenance: {
        enabled: generalSettings.maintenance,
        message: generalSettings.maintenanceMessage,
      },
    });
  };
  
  // Handle save game settings
  const handleSaveGameSettings = () => {
    updateSettingsMutation.mutate({
      game: {
        minBetAmount: Number(gameSettings.minBetAmount),
        maxBetAmount: Number(gameSettings.maxBetAmount),
        coinTossMultiplier: Number(gameSettings.coinTossMultiplier),
        sattaMatkaMultiplier: Number(gameSettings.sattaMatkaMultiplier),
      },
    });
  };
  
  // Handle save notification settings
  const handleSaveNotificationSettings = () => {
    updateSettingsMutation.mutate({
      notifications: {
        emailOnRegistration: notificationSettings.emailOnRegistration,
        emailOnDeposit: notificationSettings.emailOnDeposit,
        emailOnWithdrawal: notificationSettings.emailOnWithdrawal,
      },
    });
  };
  
  // Handle form change for general settings
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === "checkbox" ? checked : value,
    });
  };
  
  // Handle form change for game settings
  const handleGameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGameSettings({
      ...gameSettings,
      [name]: value,
    });
  };
  
  // Handle toggle for notification settings
  const handleNotificationToggle = (name: string, checked: boolean) => {
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    });
  };
  
  // Function to test email system
  const handleTestEmail = () => {
    toast({
      title: "Test email sent",
      description: "A test email has been sent to " + generalSettings.supportEmail,
    });
  };
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="game">Game Settings</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Platform Name</Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={generalSettings.siteName}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={handleGeneralChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone (Optional)</Label>
                    <Input
                      id="supportPhone"
                      name="supportPhone"
                      value={generalSettings.supportPhone}
                      onChange={handleGeneralChange}
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-8">
                    <Switch
                      id="demoMode"
                      name="demoMode"
                      checked={generalSettings.demoMode}
                      onCheckedChange={(checked) => setGeneralSettings({...generalSettings, demoMode: checked})}
                    />
                    <Label htmlFor="demoMode">Enable Demo Mode</Label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Maintenance Mode</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="maintenance"
                    name="maintenance"
                    checked={generalSettings.maintenance}
                    onCheckedChange={(checked) => setGeneralSettings({...generalSettings, maintenance: checked})}
                  />
                  <Label htmlFor="maintenance">Enable Maintenance Mode</Label>
                </div>
                {generalSettings.maintenance && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800 flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Warning: Maintenance Mode is Active</p>
                      <p className="text-sm mt-1">
                        When enabled, all users except admins will see the maintenance message and will not be able to access the platform.
                      </p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Input
                    id="maintenanceMessage"
                    name="maintenanceMessage"
                    value={generalSettings.maintenanceMessage}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveGeneralSettings} disabled={updateSettingsMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="game">
          <Card>
            <CardHeader>
              <CardTitle>Game Settings</CardTitle>
              <CardDescription>Configure betting limits and game parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Betting Limits</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minBetAmount">Minimum Bet Amount (₹)</Label>
                    <Input
                      id="minBetAmount"
                      name="minBetAmount"
                      type="number"
                      min="1"
                      value={gameSettings.minBetAmount}
                      onChange={handleGameChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxBetAmount">Maximum Bet Amount (₹)</Label>
                    <Input
                      id="maxBetAmount"
                      name="maxBetAmount"
                      type="number"
                      min="100"
                      value={gameSettings.maxBetAmount}
                      onChange={handleGameChange}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Payout Multipliers</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-800 flex items-start space-x-2 mb-4">
                  <Info className="h-5 w-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">About Multipliers</p>
                    <p className="text-sm mt-1">
                      These values determine how much players win when they successfully bet on games. Higher multipliers mean bigger payouts but potentially higher platform costs.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coinTossMultiplier">Coin Toss Multiplier</Label>
                    <Input
                      id="coinTossMultiplier"
                      name="coinTossMultiplier"
                      type="number"
                      step="0.1"
                      min="1.1"
                      max="5"
                      value={gameSettings.coinTossMultiplier}
                      onChange={handleGameChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended: 1.9 (Standard for 50/50 chance games)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sattaMatkaMultiplier">Satta Matka Multiplier</Label>
                    <Input
                      id="sattaMatkaMultiplier"
                      name="sattaMatkaMultiplier"
                      type="number"
                      step="0.1"
                      min="1"
                      max="15"
                      value={gameSettings.sattaMatkaMultiplier}
                      onChange={handleGameChange}
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended: 7.5 (Standard for digit-based lottery games)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveGameSettings} disabled={updateSettingsMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure email notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email Notifications</h3>
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label>Registration Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Send a welcome email when a user registers
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnRegistration}
                    onCheckedChange={(checked) => handleNotificationToggle("emailOnRegistration", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label>Deposit Status Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify users when their deposit status changes
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnDeposit}
                    onCheckedChange={(checked) => handleNotificationToggle("emailOnDeposit", checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label>Withdrawal Status Emails</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify users when their withdrawal status changes
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailOnWithdrawal}
                    onCheckedChange={(checked) => handleNotificationToggle("emailOnWithdrawal", checked)}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Email System Test</h3>
                <p className="text-sm text-muted-foreground">
                  Send a test email to verify that your email system is working correctly
                </p>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleTestEmail}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send Test Email
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotificationSettings} disabled={updateSettingsMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}