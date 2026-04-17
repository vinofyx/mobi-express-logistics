import { createFileRoute, Link } from "@tanstack/react-router";
import { TrackingWidget } from "@/components/TrackingWidget";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Truck, CheckCircle, Search } from "lucide-react";

export const Route = createFileRoute("/demo-tracking")({
  component: DemoTracking,
});

function DemoTracking() {
  const sampleTrackingIds = [
    { id: "LMS-HYD-20260417-XYZ1", type: "Parcel", description: "Sample parcel tracking ID" },
    { id: "SHP-HYD-20260417-ABC1", type: "Shipment", description: "Sample shipment tracking ID" },
    { id: "LMS-BLR-20260417-DEF2", type: "Parcel", description: "Another parcel sample" },
  ];

  const handleSampleClick = (trackingId: string) => {
    // This will populate the tracking widget input
    const input = document.querySelector('input[placeholder*="tracking"]') as HTMLInputElement;
    if (input) {
      input.value = trackingId;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">Tracking Demo</h1>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Parcel & Shipment Tracking Demo
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Try tracking with sample IDs or enter your own tracking number
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Tracking Widget */}
          <div className="order-2 md:order-1">
            <TrackingWidget />
          </div>

          {/* Sample IDs */}
          <div className="order-1 md:order-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Sample Tracking IDs
              </h3>
              
              <div className="space-y-3">
                {sampleTrackingIds.map((sample) => (
                  <div
                    key={sample.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {sample.type}
                          </span>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {sample.id}
                          </code>
                        </div>
                        <p className="text-xs text-gray-600">{sample.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSampleClick(sample.id)}
                        className="ml-2"
                      >
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Click "Use" on any sample ID above</li>
                  <li>Or type your own tracking ID</li>
                  <li>Click "Track Package" button</li>
                  <li>View results instantly</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Smart Detection</h3>
            <p className="text-sm text-gray-600">
              Automatically detects parcel vs shipment tracking IDs
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Real-time Results</h3>
            <p className="text-sm text-gray-600">
              Instant tracking with live status updates
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mb-4">
              <Truck className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Complete History</h3>
            <p className="text-sm text-gray-600">
              Full tracking timeline with location details
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
