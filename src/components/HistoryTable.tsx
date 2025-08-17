import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { History, Clock, Calendar, Hash } from "lucide-react";
import { DrawRecord } from "@/lib/data";

interface HistoryTableProps {
  data: DrawRecord[];
}

export const HistoryTable = ({ data }: HistoryTableProps) => {
  const getTimeIcon = (time: string) => {
    switch (time) {
      case 'Morning': return '🌅';
      case 'Midday': return '☀️';
      case 'Afternoon': return '🌤️';
      case 'Evening': return '🌙';
      default: return '⏰';
    }
  };

  const getTimeBadgeVariant = (time: string) => {
    switch (time) {
      case 'Morning': return 'secondary';
      case 'Midday': return 'default';
      case 'Afternoon': return 'secondary';
      case 'Evening': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 shadow-card">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">Draw History</h3>
          <Badge variant="outline" className="ml-auto">
            {data.length} records
          </Badge>
        </div>

        <div className="rounded-lg border border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="w-24">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Draw #
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time
                  </div>
                </TableHead>
                <TableHead className="text-right">Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.slice(0, 50).map((record) => (
                <TableRow key={record.drawId} className="border-border/50 hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {record.drawId}
                  </TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>
                    <Badge variant={getTimeBadgeVariant(record.time)} className="text-xs">
                      {getTimeIcon(record.time)} {record.time}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold">
                      {record.number}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {data.length > 50 && (
          <div className="text-center mt-4 text-sm text-muted-foreground">
            Showing latest 50 records of {data.length} total
          </div>
        )}
      </div>
    </Card>
  );
};