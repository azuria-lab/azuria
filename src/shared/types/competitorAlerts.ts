
export interface CompetitorAlert {
  id: string;
  competitor: string;
  type: 'price_drop' | 'price_increase' | 'new_competitor' | 'stock_out';
  currentPrice: number;
  previousPrice?: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface AlertSettings {
  priceDropThreshold: number;
  priceIncreaseThreshold: number;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  monitoringFrequency: 'realtime' | 'hourly' | 'daily';
}
