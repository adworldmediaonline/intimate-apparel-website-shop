'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';

const ProductDetailsCountdown = ({ offerExpiryTime }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const expiryTime = new Date(offerExpiryTime).getTime();
      const difference = expiryTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [offerExpiryTime]);

  if (isExpired) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">This offer has expired</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5 text-primary" />
          <span>Limited Time Offer</span>
          <Badge variant="destructive" className="ml-auto">
            Hurry Up!
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeUnits.map((unit, index) => (
            <div key={index} className="text-center">
              <div className="bg-background border border-border rounded-lg p-3">
                <div className="text-2xl font-bold text-foreground">
                  {unit.value.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  {unit.label}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Don't miss out on this amazing deal!
        </p>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsCountdown;
