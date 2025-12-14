'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeCategoryTabsProps {
  value: '5min' | '10min';
  onValueChange: (value: '5min' | '10min') => void;
}

export function TimeCategoryTabs({ value, onValueChange }: TimeCategoryTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onValueChange(v as '5min' | '10min')}>
      <TabsList className="glass">
        <TabsTrigger value="5min">5 Minute Blitz</TabsTrigger>
        <TabsTrigger value="10min">10 Minute Rapid</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
