'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Format amount as Nepali Rupees
 */
function formatNPR(amount) {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get month name from month number (1-12)
 */
function getMonthName(month) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

/**
 * EarningsBreakdown - Table component for detailed earnings views
 * @param {Object} props
 * @param {Array} props.data - Array of earnings data
 * @param {'student' | 'monthly'} props.type - Type of breakdown to display
 */
export default function EarningsBreakdown({ data = [], type }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No earnings data available</p>
        </CardContent>
      </Card>
    );
  }

  if (type === 'student') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Earnings by Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="text-center">Payments</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={`${item.student?._id}-${item.subject?._id}-${index}`}>
                    <TableCell className="font-medium">
                      {item.student?.name || 'Unknown'}
                    </TableCell>
                    <TableCell>{item.subject?.name || 'Unknown'}</TableCell>
                    <TableCell className="text-center">{item.paymentCount}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatNPR(item.netAmount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'monthly') {
    // Filter to only show months with earnings or all months up to current
    const currentMonthNum = new Date().getMonth() + 1;
    const displayData = data.filter(
      (item) => item.netAmount > 0 || item.month <= currentMonthNum
    );

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-center">Payments</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.map((item) => (
                  <TableRow key={`${item.year}-${item.month}`}>
                    <TableCell className="font-medium">
                      {getMonthName(item.month)} {item.year}
                    </TableCell>
                    <TableCell className="text-center">{item.paymentCount}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {formatNPR(item.netAmount || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                {displayData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No earnings this year
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
