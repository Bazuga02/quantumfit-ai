import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  CheckIcon,
  DumbbellIcon,
  BarChart3Icon,
  CalendarIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function ProgressBodyPartsTab({
  trainedToday,
  logging,
  logBodyPart,
  recentStats,
  calendarData,
  bodyPartsList,
}: {
  trainedToday: string[];
  logging: boolean;
  logBodyPart: (bp: string) => void;
  recentStats: any[];
  calendarData: { [date: string]: number };
  bodyPartsList: string[];
}) {
  // Calendar weekday labels
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const calendarDates = Object.keys(calendarData);

  return (
    <>
      {/* Today's Workout Card */}
      <Card className="border-0 bg-white dark:bg-gray-900 shadow-xl rounded-xl overflow-hidden mb-6">
        <div className="bg-primary p-4">
          <h2 className="text-md font-bold text-white flex items-center gap-2">
            <DumbbellIcon className="h-5 w-5" />
            Today's Workout
          </h2>
        </div>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {bodyPartsList.map((bp) => (
              <button
                key={bp}
                type="button"
                className={`relative p-1.5 rounded-lg font-medium text-center transition-all duration-200
                  ${
                    trainedToday.includes(bp)
                      ? "bg-primary text-white"
                      : "bg-gray-100 border border-black dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }
                `}
                disabled={logging || trainedToday.includes(bp)}
                onClick={() => logBodyPart(bp)}
              >
                {bp}
                {trainedToday.includes(bp) && (
                  <CheckIcon className="absolute top-1 right-1 h-3.5 w-3.5" />
                )}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
            Tap a body part to log it as trained for today.
          </p>
        </CardContent>
      </Card>

      {/* Statistics and Calendar Tabs */}
      <div className="w-full">
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Statistics Card */}
          <Card className="border-0 bg-white dark:bg-gray-900 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <BarChart3Icon className="h-4 w-4 mr-2" />
                Training Frequency (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={recentStats}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bodyPart" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="blue" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Card */}
          <Card className="border-0 bg-white dark:bg-gray-900 shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Training Calendar (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
                {calendarDates.map((date, i) => (
                  <div
                    key={date}
                    title={
                      date +
                      (calendarData[date] > 0
                        ? `: ${calendarData[date]} part(s)`
                        : "")
                    }
                    className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium
                      ${
                        calendarData[date] > 0
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                      }
                    `}
                  >
                    {new Date(date).getDate()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
