import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SimilarityFinder } from "@/components/similarity-finder";

export default function SimilarityPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Draft Pick Similarity Finder</h1>
        <p className="text-muted-foreground">
          Enter a hypothetical draft pick and find the historical picks with the closest
          profile, powered by a fitted scikit-learn pipeline running live on Modal.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How it works</CardTitle>
          <CardDescription>
            A custom <code>PickEquityTransformer</code> learns the historical average career
            value (point shares) for each overall pick number, then a{" "}
            <code>StandardScaler</code> + <code>NearestNeighbors</code> pipeline finds the
            closest historical picks by (pick number, age, draft year, expected equity).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimilarityFinder />
        </CardContent>
      </Card>
    </div>
  );
}
