import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Bell, 
  Mail, 
  Lock, 
  Shield, 
  Languages, 
  Moon, 
  Sun, 
  Smartphone,
  HelpCircle,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Link } from "wouter";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [gameUpdates, setGameUpdates] = useState(true);
  const [depositAlerts, setDepositAlerts] = useState(true);
  const [withdrawalAlerts, setWithdrawalAlerts] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("english");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  
  // Save notification settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      const res = await apiRequest("POST", "/api/user/settings", settingsData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Couldn't save settings",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });
  
  // Handle save settings
  const handleSaveSettings = () => {
    const settingsData = {
      notifications: {
        email: emailNotifications,
        gameUpdates,
        depositAlerts,
        withdrawalAlerts,
        sms: smsNotifications
      },
      appearance: {
        darkMode
      },
      preferences: {
        language
      },
      security: {
        twoFactorAuth
      }
    };
    
    saveSettingsMutation.mutate(settingsData);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 container py-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Settings className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <Tabs defaultValue="notifications" className="w-full">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto bg-transparent space-y-1 p-0">
                <TabsTrigger 
                  value="notifications" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="appearance" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <Sun className="h-4 w-4 mr-2" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger 
                  value="language" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <Languages className="h-4 w-4 mr-2" />
                  Language
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="help" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </TabsTrigger>
                <TabsTrigger 
                  value="about" 
                  className="justify-start w-full data-[state=active]:bg-muted"
                >
                  <Info className="h-4 w-4 mr-2" />
                  About
                </TabsTrigger>
              </TabsList>
              
              <Separator className="my-4 md:hidden" />
            </div>
            
            <div className="flex-1">
              {/* Notifications Tab */}
              <TabsContent value="notifications" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how and when you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Mail className="h-5 w-5 mr-2" />
                        Email Notifications
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email-notifications">All Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive emails for important updates and alerts
                            </p>
                          </div>
                          <Switch 
                            id="email-notifications" 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="game-updates">Game Updates</Label>
                            <p className="text-sm text-muted-foreground">
                              Receive notifications about new games and features
                            </p>
                          </div>
                          <Switch 
                            id="game-updates" 
                            checked={gameUpdates}
                            onCheckedChange={setGameUpdates}
                            disabled={!emailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="deposit-alerts">Deposit Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when your deposits are processed
                            </p>
                          </div>
                          <Switch 
                            id="deposit-alerts" 
                            checked={depositAlerts}
                            onCheckedChange={setDepositAlerts}
                            disabled={!emailNotifications}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="withdrawal-alerts">Withdrawal Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                              Get notified when your withdrawals are processed
                            </p>
                          </div>
                          <Switch 
                            id="withdrawal-alerts" 
                            checked={withdrawalAlerts}
                            onCheckedChange={setWithdrawalAlerts}
                            disabled={!emailNotifications}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Smartphone className="h-5 w-5 mr-2" />
                        SMS Notifications
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="sms-notifications">SMS Alerts</Label>
                          <p className="text-sm text-muted-foreground">
                            Receive text messages for critical updates
                          </p>
                        </div>
                        <Switch 
                          id="sms-notifications" 
                          checked={smsNotifications}
                          onCheckedChange={setSmsNotifications}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Appearance Tab */}
              <TabsContent value="appearance" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                      Customize how StakePlay looks for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dark-mode" className="flex items-center">
                            {darkMode ? (
                              <Moon className="h-5 w-5 mr-2" />
                            ) : (
                              <Sun className="h-5 w-5 mr-2" />
                            )}
                            {darkMode ? "Dark Mode" : "Light Mode"}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Switch between light and dark theme
                          </p>
                        </div>
                        <Switch 
                          id="dark-mode" 
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Language Tab */}
              <TabsContent value="language" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Language</CardTitle>
                    <CardDescription>
                      Select your preferred language
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${language === "english" ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => setLanguage("english")}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">English</p>
                            {language === "english" && (
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </div>
                        
                        <div 
                          className={`border rounded-lg p-4 cursor-pointer ${language === "hindi" ? "border-primary bg-primary/5" : ""}`}
                          onClick={() => setLanguage("hindi")}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium">हिंदी (Hindi)</p>
                            {language === "hindi" && (
                              <div className="h-3 w-3 rounded-full bg-primary"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="two-factor" className="flex items-center">
                            <Lock className="h-5 w-5 mr-2" />
                            Two-Factor Authentication
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch 
                          id="two-factor" 
                          checked={twoFactorAuth}
                          onCheckedChange={setTwoFactorAuth}
                        />
                      </div>
                      
                      <div className="mt-4">
                        <Link href="/profile">
                          <Button variant="outline">
                            Change Password
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Help & Support Tab */}
              <TabsContent value="help" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Get assistance with your account or gameplay
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-6 bg-muted/50">
                        <h3 className="text-lg font-medium mb-2">Contact Support</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Our support team is available 24/7 to assist you with any issues.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>support@stakeplay.com</span>
                          </div>
                          <div className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>+91 12345 67890</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-2">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">How do I make a deposit?</h4>
                            <p className="text-sm text-muted-foreground">
                              Go to the Wallet page and click on the "Deposit" button, then follow the instructions.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">How long do withdrawals take?</h4>
                            <p className="text-sm text-muted-foreground">
                              Withdrawals are processed within 24 hours after admin verification.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">What games are available?</h4>
                            <p className="text-sm text-muted-foreground">
                              We currently offer Satta Matka and Coin Toss games, with more games coming soon.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* About Tab */}
              <TabsContent value="about" className="m-0">
                <Card>
                  <CardHeader>
                    <CardTitle>About StakePlay</CardTitle>
                    <CardDescription>
                      Information about our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-2">StakePlay</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          StakePlay is a virtual betting platform offering exciting games like Satta Matka and Coin Toss.
                          We provide a secure environment for players to enjoy traditional and modern betting games.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">Version:</span>
                            <span className="text-sm">1.0.0</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">Released:</span>
                            <span className="text-sm">April 2025</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border rounded-lg p-6">
                        <h3 className="text-lg font-medium mb-2">Legal Information</h3>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium">Terms of Service</h4>
                            <p className="text-sm text-muted-foreground">
                              By using StakePlay, you agree to our terms and conditions regarding gameplay and virtual transactions.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Privacy Policy</h4>
                            <p className="text-sm text-muted-foreground">
                              We are committed to protecting your personal information and providing a secure gaming experience.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button 
            onClick={handleSaveSettings}
            disabled={saveSettingsMutation.isPending}
          >
            {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}