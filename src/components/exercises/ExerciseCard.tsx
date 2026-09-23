import React from 'react';
import Link from 'next/link';
import { Play, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export interface ExerciseCardProps {
  id: string;
  name: string;
  category: string;
  targetJoint: string;
  targetAngleMin: number;
  recommendedReps: number;
  recommendedSets: number;
  holdSeconds: number;
  description: string;
  actionHref?: string;
  isPrescribed?: boolean;
}

export function ExerciseCard({
  id,
  name,
  category,
  targetJoint,
  targetAngleMin,
  recommendedReps,
  recommendedSets,
  holdSeconds,
  description,
  actionHref = `/patient/exercises`,
  isPrescribed = false,
}: ExerciseCardProps) {
  return (
    <Card className="flex flex-col justify-between hover:border-slate-700 transition-colors">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-1">
            <Badge variant="outline" className="capitalize">
              {category.replace('_', ' ')}
            </Badge>
            {isPrescribed && (
              <Badge variant="success">Prescribed</Badge>
            )}
          </div>
          <CardTitle className="text-base">{name}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Target Angle:</span>
              <span className="font-mono font-bold text-cyan-400">{targetAngleMin}° minimum</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Dosage:</span>
              <span className="font-medium text-white">{recommendedSets} sets × {recommendedReps} reps</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Peak Hold:</span>
              <span className="font-medium text-white">{holdSeconds}s steady</span>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter>
        <Link href={actionHref} className="w-full">
          <Button variant="secondary" size="sm" className="w-full justify-between">
            <span>View Protocol Details</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
