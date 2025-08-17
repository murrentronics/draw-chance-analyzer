import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseBulkDrawData, bulkInsertDraws } from "@/lib/bulkDataImport";

interface BulkDataImportProps {
  onImportComplete: () => void;
}

export const BulkDataImport = ({ onImportComplete }: BulkDataImportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleBulkImport = async () => {
    setIsImporting(true);
    
    try {
      const rawData = `Saturday
15 Feb 2025
Morning
20
Midday
36
Afternoon
25
Evening
7
Friday
14 Feb 2025
Morning
24
Midday
25
Afternoon
29
Evening
27
Thursday
13 Feb 2025
Morning
22
Midday
13
Afternoon
4
Evening
29
Wednesday
12 Feb 2025
Morning
27
Midday
24
Afternoon
30
Evening
9
Tuesday
11 Feb 2025
Morning
10
Midday
29
Afternoon
13
Evening
8
Monday
10 Feb 2025
Morning
7
Midday
21
Afternoon
35
Evening
18
Saturday
08 Feb 2025
Morning
16
Midday
9
Afternoon
15
Evening
2
Friday
07 Feb 2025
Morning
14
Midday
3
Afternoon
9
Evening
8
Thursday
06 Feb 2025
Morning
35
Midday
21
Afternoon
22
Evening
36
Wednesday
05 Feb 2025
Morning
12
Midday
36
Afternoon
34
Evening
11
Tuesday
04 Feb 2025
Morning
18
Midday
5
Afternoon
31
Evening
10
Monday
03 Feb 2025
Morning
13
Midday
11
Afternoon
30
Evening
16
Saturday
01 Feb 2025
Morning
8
Midday
27
Afternoon
17
Evening
26
Friday
31 Jan 2025
Morning
18
Midday
34
Afternoon
31
Evening
34
Thursday
30 Jan 2025
Morning
30
Midday
9
Afternoon
30
Evening
25
Wednesday
29 Jan 2025
Morning
30
Midday
10
Afternoon
18
Evening
19
Tuesday
28 Jan 2025
Morning
12
Midday
18
Afternoon
34
Evening
35
Monday
27 Jan 2025
Morning
13
Midday
9
Afternoon
9
Evening
31
Saturday
25 Jan 2025
Morning
35
Midday
34
Afternoon
31
Evening
32
Friday
24 Jan 2025
Morning
1
Midday
4
Afternoon
15
Evening
14
Thursday
23 Jan 2025
Morning
20
Midday
28
Afternoon
26
Evening
6
Wednesday
22 Jan 2025
Morning
17
Midday
13
Afternoon
10
Evening
14
Tuesday
21 Jan 2025
Morning
28
Midday
5
Afternoon
12
Evening
23
Monday
20 Jan 2025
Morning
26
Midday
33
Afternoon
20
Evening
5
Saturday
18 Jan 2025
Morning
6
Midday
26
Afternoon
20
Evening
21
Friday
17 Jan 2025
Morning
4
Midday
3
Afternoon
12
Evening
3
Thursday
16 Jan 2025
Morning
33
Midday
8
Afternoon
15
Evening
19
Wednesday
15 Jan 2025
Morning
36
Midday
31
Afternoon
11
Evening
36
Tuesday
14 Jan 2025
Morning
25
Midday
7
Afternoon
1
Evening
26
Monday
13 Jan 2025
Morning
18
Midday
11
Afternoon
25
Evening
13
Saturday
11 Jan 2025
Morning
29
Midday
34
Afternoon
31
Evening
28
Friday
10 Jan 2025
Morning
34
Midday
4
Afternoon
4
Evening
23
Thursday
09 Jan 2025
Morning
31
Midday
18
Afternoon
8
Evening
9
Wednesday
08 Jan 2025
Morning
4
Midday
28
Afternoon
8
Evening
7
Tuesday
07 Jan 2025
Morning
17
Midday
24
Afternoon
3
Evening
11
Monday
06 Jan 2025
Morning
7
Midday
18
Afternoon
10
Evening
20
Saturday
04 Jan 2025
Morning
25
Midday
19
Afternoon
25
Evening
16
Friday
03 Jan 2025
Morning
25
Midday
20
Afternoon
28
Evening
8
Thursday
02 Jan 2025
Morning
12
Midday
15
Afternoon
11
Evening
26
Wednesday
01 Jan 2025
Morning
7
Midday
24
Afternoon
11
Evening
32
Tuesday
31 Dec 2024
Morning
7
Midday
16
Afternoon
32
Evening
21
Monday
30 Dec 2024
Morning
23
Midday
15
Afternoon
25
Evening
15
Saturday
28 Dec 2024
Morning
13
Midday
24
Afternoon
29
Evening
35
Friday
27 Dec 2024
Morning
27
Midday
27
Afternoon
34
Evening
32
Thursday
26 Dec 2024
Morning
29
Midday
35
Afternoon
20
Evening
5
Tuesday
24 Dec 2024
Morning
26
Midday
3
Afternoon
4
Evening
34
Monday
23 Dec 2024
Morning
32
Midday
24
Afternoon
20
Evening
32
Saturday
21 Dec 2024
Morning
36
Midday
7
Afternoon
36
Evening
4
Friday
20 Dec 2024
Morning
12
Midday
14
Afternoon
20
Evening
10
Thursday
19 Dec 2024
Morning
6
Midday
15
Afternoon
32
Evening
9
Wednesday
18 Dec 2024
Morning
2
Midday
32
Afternoon
14
Evening
27
Tuesday
17 Dec 2024
Morning
18
Midday
21
Afternoon
20
Evening
5
Monday
16 Dec 2024
Morning
19
Midday
3
Afternoon
11
Evening
15
Saturday
14 Dec 2024
Morning
29
Midday
6
Afternoon
15
Evening
30
Friday
13 Dec 2024
Morning
9
Midday
22
Afternoon
27
Evening
4
Thursday
12 Dec 2024
Morning
20
Midday
36
Afternoon
19
Evening
2
Wednesday
11 Dec 2024
Morning
33
Midday
17
Afternoon
32
Evening
13
Tuesday
10 Dec 2024
Morning
1
Midday
36
Afternoon
36
Evening
26
Monday
09 Dec 2024
Morning
23
Midday
13
Afternoon
28
Evening
36
Saturday
07 Dec 2024
Morning
4
Midday
32
Afternoon
9
Evening
1
Friday
06 Dec 2024
Morning
24
Midday
2
Afternoon
33
Evening
17
Thursday
05 Dec 2024
Morning
20
Midday
29
Afternoon
4
Evening
28
Wednesday
04 Dec 2024
Morning
13
Midday
12
Afternoon
34
Evening
10
Tuesday
03 Dec 2024
Morning
34
Midday
5
Afternoon
22
Evening
14
Monday
02 Dec 2024
Morning
4
Midday
7
Afternoon
12
Evening
15
Saturday
30 Nov 2024
Morning
12
Midday
6
Afternoon
2
Evening
2
Friday
29 Nov 2024
Morning
19
Midday
30
Afternoon
26
Evening
22
Thursday
28 Nov 2024
Morning
19
Midday
31
Afternoon
4
Evening
18
Wednesday
27 Nov 2024
Morning
7
Midday
3
Afternoon
11
Evening
25
Tuesday
26 Nov 2024
Morning
11
Midday
31
Afternoon
6
Evening
33
Monday
25 Nov 2024
Morning
31
Midday
23
Afternoon
29
Evening
20
Saturday
23 Nov 2024
Morning
15
Midday
12
Afternoon
13
Evening
15
Friday
22 Nov 2024
Morning
27
Midday
30
Afternoon
10
Evening
11
Thursday
21 Nov 2024
Morning
30
Midday
11
Afternoon
17
Evening
24
Wednesday
20 Nov 2024
Morning
32
Midday
7
Afternoon
5
Evening
28
Tuesday
19 Nov 2024
Morning
8
Midday
28
Afternoon
34
Evening
27
Monday
18 Nov 2024
Morning
11
Midday
1
Afternoon
4
Evening
31
Saturday
16 Nov 2024
Morning
7
Midday
11
Afternoon
20
Evening
24
Friday
15 Nov 2024
Morning
24
Midday
17
Afternoon
6
Evening
19
Thursday
14 Nov 2024
Morning
19
Midday
28
Afternoon
27
Evening
24
Wednesday
13 Nov 2024
Morning
30
Midday
15
Afternoon
26
Evening
28
Tuesday
12 Nov 2024
Morning
1
Midday
32
Afternoon
11
Evening
21
Monday
11 Nov 2024
Morning
31
Midday
10
Afternoon
12
Evening
26
Saturday
09 Nov 2024
Morning
30
Midday
17
Afternoon
10
Evening
4
Friday
08 Nov 2024
Morning
36
Midday
22
Afternoon
33
Evening
15
Thursday
07 Nov 2024
Morning
24
Midday
29
Afternoon
14
Evening
6
Wednesday
06 Nov 2024
Morning
21
Midday
18
Afternoon
9
Evening
7
Tuesday
05 Nov 2024
Morning
35
Midday
31
Afternoon
29
Evening
19
Monday
04 Nov 2024
Morning
2
Midday
10
Afternoon
33
Evening
25
Saturday
02 Nov 2024
Morning
26
Midday
33
Afternoon
17
Evening
27
Friday
01 Nov 2024
Morning
16
Midday
29
Afternoon
3
Evening
15
Wednesday
30 Oct 2024
Morning
3
Midday
11
Afternoon
3
Evening
20
Tuesday
29 Oct 2024
Morning
2
Midday
29
Afternoon
18
Evening
13
Monday
28 Oct 2024
Morning
28
Midday
29
Afternoon
31
Evening
12
Saturday
26 Oct 2024
Morning
16
Midday
7
Afternoon
24
Evening
32
Friday
25 Oct 2024
Morning
20
Midday
23
Afternoon
2
Evening
36
Thursday
24 Oct 2024
Morning
18
Midday
19
Afternoon
5
Evening
12
Wednesday
23 Oct 2024
Morning
5
Midday
8
Afternoon
21
Evening
1
Tuesday
22 Oct 2024
Morning
15
Midday
1
Afternoon
2
Evening
8
Monday
21 Oct 2024
Morning
19
Midday
29
Afternoon
16
Evening
31
Saturday
19 Oct 2024
Morning
32
Midday
29
Afternoon
19
Evening
6
Friday
18 Oct 2024
Morning
34
Midday
1
Afternoon
26
Evening
18
Thursday
17 Oct 2024
Morning
1
Midday
1
Afternoon
15
Evening
4
Wednesday
16 Oct 2024
Morning
6
Midday
29
Afternoon
24
Evening
18
Tuesday
15 Oct 2024
Morning
31
Midday
18
Afternoon
6
Evening
24
Monday
14 Oct 2024
Morning
31
Midday
26
Afternoon
4
Evening
30
Saturday
12 Oct 2024
Morning
21
Midday
33
Afternoon
7
Evening
3
Friday
11 Oct 2024
Morning
23
Midday
19
Afternoon
25
Evening
17
Thursday
10 Oct 2024
Morning
21
Midday
17
Afternoon
1
Evening
26
Wednesday
09 Oct 2024
Morning
15
Midday
11
Afternoon
28
Evening
24`;

      const parsedDraws = parseBulkDrawData(rawData);
      console.log(`Parsed ${parsedDraws.length} draws`);
      
      await bulkInsertDraws(parsedDraws);
      
      toast({
        title: "Bulk Import Successful",
        description: `Successfully imported ${parsedDraws.length} historical draws`,
        variant: "default",
      });
      
      onImportComplete();
      
    } catch (error) {
      console.error('Bulk import error:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import historical data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card mb-6">
      <div className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2 mb-2">
            <Database className="w-6 h-6 text-primary" />
            Import Historical Data
          </h3>
          <p className="text-muted-foreground">
            Import 500+ historical draws to enable high-accuracy predictions
          </p>
        </div>

        <div className="flex justify-center">
          <Button 
            onClick={handleBulkImport}
            disabled={isImporting}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isImporting ? "Importing..." : "Import Historical Data"}
          </Button>
        </div>
      </div>
    </Card>
  );
};