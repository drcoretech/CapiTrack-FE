import React from 'react';
import {
  Utensils,
  Car,
  ShoppingCart,
  Film,
  HeartPulse,
  ShoppingBag,
  Zap,
  Sparkles,
  Calendar,
  Tag,
  CircleDollarSign,
  Coffee,
  Plane,
  Home,
  Briefcase,
} from 'lucide-react-native';
import { Colors } from '../theme/colors';

interface CategoryIconProps {
  category?: string;
  icon?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  category = '',
  icon = '',
  size = 18,
  color = Colors.moss,
  strokeWidth = 2,
}) => {
  const normCat = (category || '').toLowerCase().trim();
  const normIcon = (icon || '').trim();

  // If calendar icon is specified (e.g. for monthly rollups)
  if (normIcon === '📅' || normCat === 'monthly_total' || normCat === 'monthly') {
    return <Calendar size={size} color={color} strokeWidth={strokeWidth} />;
  }

  // Match by category name or emoji
  if (normCat === 'food' || normIcon === '🍔' || normIcon === '🍕') {
    return <Utensils size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'travel' || normIcon === '🚕' || normIcon === '✈️' || normCat === 'commute') {
    return <Car size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'grocery' || normIcon === '🛒' || normCat === 'groceries') {
    return <ShoppingCart size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'fun' || normCat === 'entertainment' || normIcon === '🎬' || normIcon === '🍿') {
    return <Film size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'health' || normIcon === '💊' || normCat === 'medical' || normCat === 'fitness') {
    return <HeartPulse size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'shopping' || normIcon === '🛍️' || normIcon === '🛍') {
    return <ShoppingBag size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'bills' || normCat === 'utilities' || normIcon === '💡' || normIcon === '⚡') {
    return <Zap size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'freelance' || normCat === 'client' || normIcon === '💼') {
    return <Briefcase size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'rent' || normIcon === '🏠') {
    return <Home size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'coffee' || normIcon === '☕') {
    return <Coffee size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'flight' || normIcon === '🛫') {
    return <Plane size={size} color={color} strokeWidth={strokeWidth} />;
  }
  if (normCat === 'custom' || normIcon === '➕' || normIcon === '✨') {
    return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;
  }

  // Fallback icon
  return <Tag size={size} color={color} strokeWidth={strokeWidth} />;
};
