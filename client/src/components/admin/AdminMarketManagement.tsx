import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Clock,
  Calendar,
  Edit,
  Trash,
  PlusCircle,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { format, parse, addMonths } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar as DateCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Market {
  id: string;
  name: string;
  displayName: string;
  description: string;
  openTime: string;
  closeTime: string;
  resultTime: string;
  status: "open" | "closed" | "results";
  color: string;
  latestResult?: string;
  resultDate?: string;
  startDate: string;
  endDate: string;
  coverImage: string;
  allowedBetTypes: string[];
}

interface MarketResult {
  id: number;
  marketId: string;
  result: string;
  date: string;
  createdAt: string;
}

export default function AdminMarketManagement() {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [isEditMarketOpen, setIsEditMarketOpen] = useState(false);
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);
  const [marketFormData, setMarketFormData] = useState({
    id: "",
    name: "",
    displayName: "",
    description: "",
    openTime: "09:00",
    closeTime: "17:00",
    resultTime: "17:30",
    color: "#6366f1",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    coverImage: "",
    allowedBetTypes: ["jodi", "oddEven", "cross", "hurf"],
  });
  const [resultFormData, setResultFormData] = useState({
    result: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });
  const [activeTab, setActiveTab] = useState("markets");

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch markets
  const { data: markets = [], isLoading: isLoadingMarkets } = useQuery<Market[]>({
    queryKey: ["/api/admin/markets"],
    retry: false,
  });

  // Fetch results
  const { data: results = [], isLoading: isLoadingResults } = useQuery<MarketResult[]>({
    queryKey: ["/api/admin/results"],
    retry: false,
  });

  // Create/Update market mutation
  const updateMarketMutation = useMutation({
    mutationFn: async (marketData: Partial<Market>) => {
      const { id, ...rest } = marketData;
      if (!id) {
        // Create new market
        const res = await apiRequest("POST", "/api/admin/markets", rest);
        const data = await res.json();
        return data;
      } else {
        // Update existing market
        const res = await apiRequest("PATCH", `/api/admin/markets/${id}`, rest);
        const data = await res.json();
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/markets"] });
      toast({
        title: marketFormData.id ? "Market Updated" : "Market Created",
        description: marketFormData.id 
          ? "Market information has been updated successfully."
          : "New market has been created successfully.",
      });
      setIsEditMarketOpen(false);
      // Force refresh the markets list
      queryClient.refetchQueries({ queryKey: ["/api/admin/markets"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add result mutation
  const addResultMutation = useMutation({
    mutationFn: async (data: { marketId: string; result: string; date: string }) => {
      const res = await apiRequest("POST", "/api/admin/results", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/results"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/markets"] });
      toast({
        title: "Result added",
        description: "Game result has been added successfully.",
      });
      setIsAddResultOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add result",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle edit market
  const handleEditMarket = (market: Market) => {
    setSelectedMarket(market);
    setMarketFormData({
      id: market.id,
      name: market.name,
      displayName: market.displayName,
      description: market.description,
      openTime: market.openTime,
      closeTime: market.closeTime,
      resultTime: market.resultTime,
      color: market.color,
      startDate: market.startDate,
      endDate: market.endDate,
      coverImage: market.coverImage,
      allowedBetTypes: market.allowedBetTypes,
    });
    setIsEditMarketOpen(true);
  };

  // Handle add result
  const handleAddResult = (market: Market) => {
    setSelectedMarket(market);
    setResultFormData({
      result: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setIsAddResultOpen(true);
  };

  // Handle market form change
  const handleMarketFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setMarketFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle result form change
  const handleResultFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResultFormData({
      ...resultFormData,
      [name]: value,
    });
  };

  // Handle market form submit
  const handleMarketFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!marketFormData.displayName || !marketFormData.startDate || !marketFormData.endDate || 
        !marketFormData.openTime || !marketFormData.closeTime || !marketFormData.resultTime ||
        marketFormData.allowedBetTypes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Prepare data in the correct format
    const formattedData = {
      ...marketFormData,
      allowedBetTypes: JSON.stringify(marketFormData.allowedBetTypes)
    };

    updateMarketMutation.mutate(formattedData);
  };

  // Handle result form submit
  const handleResultFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMarket) {
      addResultMutation.mutate({
        marketId: selectedMarket.id,
        result: resultFormData.result,
        date: resultFormData.date,
      });
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return new Date().setHours(parseInt(hours), parseInt(minutes), 0, 0);
    } catch (e) {
      return null;
    }
  };

  const getMarketStatus = (market: Market) => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const openTimeParts = market.openTime.split(':');
    const openTimeInMinutes = parseInt(openTimeParts[0]) * 60 + parseInt(openTimeParts[1]);

    const closeTimeParts = market.closeTime.split(':');
    const closeTimeInMinutes = parseInt(closeTimeParts[0]) * 60 + parseInt(closeTimeParts[1]);

    const resultTimeParts = market.resultTime.split(':');
    const resultTimeInMinutes = parseInt(resultTimeParts[0]) * 60 + parseInt(resultTimeParts[1]);

    if (currentTimeInMinutes >= resultTimeInMinutes || 
        (currentTimeInMinutes < openTimeInMinutes && resultTimeInMinutes < openTimeInMinutes)) {
      return "results";
    } else if (currentTimeInMinutes >= closeTimeInMinutes) {
      return "closed";
    } else {
      return "open";
    }
  };

  const formatTimeDisplay = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      return format(time, 'h:mm a');
    } catch (e) {
      return timeString;
    }
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  // Filter results for the selected market
  const getMarketResults = (marketId: string) => {
    return results
      .filter(result => result.marketId === marketId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="markets">
            <Calendar className="mr-2 h-4 w-4" />
            Market Management
          </TabsTrigger>
          <TabsTrigger value="results">
            <CheckCircle className="mr-2 h-4 w-4" />
            Results History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="markets">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Satta Matka Markets</CardTitle>
                  <CardDescription>Manage game markets and their timings</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedMarket(null);
                    setMarketFormData({
                      id: "",
                      name: "",
                      displayName: "",
                      description: "",
                      openTime: "09:00",
                      closeTime: "17:00",
                      resultTime: "17:30",
                      color: "#6366f1",
                      startDate: format(new Date(), "yyyy-MM-dd"),
                      endDate: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
                      coverImage: "",
                      allowedBetTypes: ["jodi", "oddEven", "cross", "hurf"],
                    });
                    setIsEditMarketOpen(true);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Market
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingMarkets ? (
                <div className="text-center py-4">Loading markets...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Market</TableHead>
                        <TableHead>Open Time</TableHead>
                        <TableHead>Close Time</TableHead>
                        <TableHead>Result Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Latest Result</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {markets.map((market) => {
                        const status = getMarketStatus(market);
                        const marketResults = getMarketResults(market.id);
                        const latestResult = marketResults.length > 0 ? marketResults[0] : null;

                        return (
                          <TableRow key={market.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: market.color }}
                                />
                                <div>
                                  <div className="font-medium">{market.displayName}</div>
                                  <div className="text-xs text-muted-foreground">{market.description}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatTimeDisplay(market.openTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatTimeDisplay(market.closeTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                                {formatTimeDisplay(market.resultTime)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  status === "open"
                                    ? "bg-green-100 text-green-800"
                                    : status === "closed"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {latestResult ? (
                                <div>
                                  <span className="font-medium">{latestResult.result}</span>
                                  <div className="text-xs text-muted-foreground">
                                    {formatDateDisplay(latestResult.date)}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">No results yet</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditMarket(market)}
                                className="mr-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleAddResult(market)}
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Results History</CardTitle>
              <CardDescription>View all Satta Matka game results</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingResults ? (
                <div className="text-center py-4">Loading results...</div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Added On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No results found
                          </TableCell>
                        </TableRow>
                      ) : (
                        results
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((result) => {
                            const market = markets.find(m => m.id === result.marketId);

                            return (
                              <TableRow key={result.id}>
                                <TableCell>{result.id}</TableCell>
                                <TableCell>
                                  {market ? (
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ backgroundColor: market.color }} 
                                      />
                                      <span>{market.displayName}</span>
                                    </div>
                                  ) : (
                                    result.marketId
                                  )}
                                </TableCell>
                                <TableCell>
                                  <span className="font-bold">{result.result}</span>
                                </TableCell>
                                <TableCell>{formatDateDisplay(result.date)}</TableCell>
                                <TableCell>{formatDateDisplay(result.createdAt)}</TableCell>
                              </TableRow>
                            );
                          })
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Market Dialog */}
      <Dialog open={isEditMarketOpen} onOpenChange={setIsEditMarketOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{marketFormData.id ? "Edit Market" : "Create New Market"}</DialogTitle>
            <DialogDescription>{marketFormData.id ? "Update market details and timings" : "Create a new market with details and timings"}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleMarketFormSubmit}>
            <div className="grid gap-4 py-4 overflow-y-auto pr-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="displayName" className="text-right">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={marketFormData.displayName}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  name="description"
                  value={marketFormData.description}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Open Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !marketFormData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {marketFormData.startDate ? format(new Date(marketFormData.startDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DateCalendar
                        mode="single"
                        selected={new Date(marketFormData.startDate)}
                        onSelect={(date) => setMarketFormData(prev => ({
                          ...prev,
                          startDate: date ? format(date, 'yyyy-MM-dd') : prev.startDate
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="openTime" className="text-right">
                  Open Time
                </Label>
                <Input
                  id="openTime"
                  name="openTime"
                  type="time"
                  value={marketFormData.openTime}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Close Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !marketFormData.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {marketFormData.endDate ? format(new Date(marketFormData.endDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DateCalendar
                        mode="single"
                        selected={new Date(marketFormData.endDate)}
                        onSelect={(date) => setMarketFormData(prev => ({
                          ...prev,
                          endDate: date ? format(date, 'yyyy-MM-dd') : prev.endDate
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="closeTime" className="text-right">
                  Close Time
                </Label>
                <Input
                  id="closeTime"
                  name="closeTime"
                  type="time"
                  value={marketFormData.closeTime}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resultDate" className="text-right">
                  Result Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !marketFormData.resultDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {marketFormData.resultDate ? format(new Date(marketFormData.resultDate), "PPP") : <span>Same as Close Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <DateCalendar
                        mode="single"
                        selected={marketFormData.resultDate ? new Date(marketFormData.resultDate) : new Date(marketFormData.endDate)}
                        onSelect={(date) => setMarketFormData(prev => ({
                          ...prev,
                          resultDate: date ? format(date, 'yyyy-MM-dd') : prev.resultDate
                        }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resultTime" className="text-right">
                  Result Time
                </Label>
                <Input
                  id="resultTime"
                  name="resultTime"
                  type="time"
                  value={marketFormData.resultTime}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    value={marketFormData.color}
                    onChange={handleMarketFormChange}
                    className="w-16 h-10 p-1"
                  />
                  <div
                    className="h-10 w-10 rounded-md border"
                    style={{ backgroundColor: marketFormData.color }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="coverImage" className="text-right">
                  Cover Image URL
                </Label>
                <Input
                  id="coverImage"
                  name="coverImage"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={marketFormData.coverImage}
                  onChange={handleMarketFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Allowed Bet Types
                </Label>
                <div className="col-span-3 grid grid-cols-2 gap-3">
                  {[
                    { id: "jodi", name: "Jodi", icon: "🎲", value: "jodi" },
                    { id: "oddEven", name: "Odd/Even", icon: "⚖️", value: "oddEven" },
                    { id: "cross", name: "Cross", icon: "✖️", value: "cross" },
                    { id: "hurf", name: "Hurf", icon: "🎯", value: "hurf" }
                  ].map((betType) => (
                    <div
                      key={betType.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        marketFormData.allowedBetTypes.includes(betType.value)
                          ? "bg-primary/10 border-primary"
                          : "bg-background hover:bg-primary/5"
                      }`}
                      onClick={() => {
                        const newTypes = marketFormData.allowedBetTypes.includes(betType.value)
                          ? marketFormData.allowedBetTypes.filter(t => t !== betType.value)
                          : [...marketFormData.allowedBetTypes, betType.value];
                        setMarketFormData(prev => ({
                          ...prev,
                          allowedBetTypes: newTypes
                        }));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{betType.icon}</span>
                        <span className="font-medium">{betType.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditMarketOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMarketMutation.isPending}>
                {updateMarketMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Result Dialog */}
      <Dialog open={isAddResultOpen} onOpenChange={setIsAddResultOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Declare Result</DialogTitle>
            <DialogDescription>
              Add result for {selectedMarket?.displayName || "market"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResultFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="result" className="text-right">
                  Result
                </Label>
                <Input
                  id="result"
                  name="result"
                  value={resultFormData.result}
                  onChange={handleResultFormChange}
                  placeholder="eg. 78"
                  maxLength={2}
                  pattern="[0-9]{2}"
                  title="Please enter exactly 2 digits"
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={resultFormData.date}
                  onChange={handleResultFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="col-span-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Important Notice</p>
                    <p className="text-sm mt-1">
                      Declaring a result will automatically process all pending bets for this market and date.
                      This action cannot be undone, so please verify the result before confirming.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddResultOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addResultMutation.isPending}>
                {addResultMutation.isPending ? "Processing..." : "Declare Result"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}