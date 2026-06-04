import React from 'react';
import Svg, { Path, Circle, Line, G, Rect } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function HomeIcon({ color = '#8B6E52', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Path d="M11 2L2 9.5V20H8V14H14V20H20V9.5L11 2Z" fill={color} />
    </Svg>
  );
}

export function ScheduleIcon({ color = '#8B6E52', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Path
        d="M5 3H17C18.1 3 19 3.9 19 5V17C19 18.1 18.1 19 17 19H5C3.9 19 3 18.1 3 17V5C3 3.9 3.9 3 5 3ZM5 9V17H17V9H5ZM5 5V7H17V5H5ZM7 11H9V13H7V11ZM11 11H13V13H11V11ZM15 11H17V13H15V11Z"
        fill={color}
      />
    </Svg>
  );
}

export function HistoryIcon({ color = '#8B6E52', size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Path
        d="M11 3C6.6 3 3 6.6 3 11C3 15.4 6.6 19 11 19C15.4 19 19 15.4 19 11C19 6.6 15.4 3 11 3ZM11 5C14.3 5 17 7.7 17 11C17 14.3 14.3 17 11 17C7.7 17 5 14.3 5 11C5 7.7 7.7 5 11 5ZM10 7V11.4L13.6 13.6L14.4 12.2L11.5 10.5V7H10Z"
        fill={color}
      />
    </Svg>
  );
}

export function SettingsIcon({ color = '#8B6E52', size = 22 }: IconProps) {
  // Sliders / controls icon
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22">
      <Path d="M3 6H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={7} cy={6} r={2.2} fill={color} />
      <Path d="M3 11H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={14} cy={11} r={2.2} fill={color} />
      <Path d="M3 16H19" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
      <Circle cx={8} cy={16} r={2.2} fill={color} />
    </Svg>
  );
}

export function ChevronDownIcon({ color = '#C8914F', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 5L7 9L11 5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function ChevronUpIcon({ color = '#C8914F', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 9L7 5L11 9" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function ChevronRightIcon({ color = '#B07845', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M6 4L10 8L6 12" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function ClockIcon({ color = '#8B6E52', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={6.5} stroke={color} strokeWidth={1.5} fill="none" />
      <Path d="M9 5.5V9L11 10.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

type BellIconProps = IconProps & { silenced?: boolean };

export function BellIcon({ color = '#C8914F', size = 18, silenced = false }: BellIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <G>
        <Path
          d="M9 2C8.4 2 8 2.4 8 3V3.3C5.7 3.8 4 5.7 4 8V11L3 12V13H15V12L14 11V8C14 5.7 12.3 3.8 10 3.3V3C10 2.4 9.6 2 9 2Z"
          fill={color}
        />
        <Path d="M7.5 14C7.5 14.8 8.2 15.5 9 15.5C9.8 15.5 10.5 14.8 10.5 14H7.5Z" fill={color} />
      </G>
      {silenced && (
        <Line x1={3} y1={3} x2={15} y2={15} stroke={color} strokeWidth={2} strokeLinecap="round" />
      )}
    </Svg>
  );
}

export function HomeProfileIcon({ color = '#C8914F', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M9 2L2 7.5V16H6V11H12V16H16V7.5L9 2Z" fill={color} />
    </Svg>
  );
}

export function OutdoorsProfileIcon({ color = '#8B6E52', size = 16 }: IconProps) {
  // Sun with rays
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={3} fill={color} />
      <Path d="M9 1.5V3M9 15V16.5M1.5 9H3M15 9H16.5M3.7 3.7L4.8 4.8M13.2 13.2L14.3 14.3M3.7 14.3L4.8 13.2M13.2 4.8L14.3 3.7" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function PlusIcon({ color = '#C8914F', size = 16 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M9 4V14M4 9H14" stroke={color} strokeWidth={2} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function EditIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M2 14L4 11L11 4L14 7L7 14L4 16L2 14Z" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <Path d="M11 4L13 2L16 5L14 7" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function XIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M5 5L13 13M13 5L5 13" stroke={color} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function BackArrowIcon({ color = '#3D2B1F', size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20">
      <Path d="M13 4L7 10L13 16" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function PlayIcon({ color = '#C8914F', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 3L11 7L3 11Z" fill={color} />
    </Svg>
  );
}

export function GlobeIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M9 1C4.6 1 1 4.6 1 9C1 13.4 4.6 17 9 17C13.4 17 17 13.4 17 9C17 4.6 13.4 1 9 1ZM3 9C3 8.3 3.1 7.6 3.3 6.9L7 10.6V11.4C7 12.3 7.7 13 8.6 13L9 13V14.9C5.6 14.4 3 11.5 3 9ZM13.4 13.4L11 11V10.4C11 9.5 10.3 8.8 9.4 8.8H6.6V7.2C6.6 6.7 7 6.4 7.4 6.4H8V5.6C8 5.1 8.4 4.7 8.8 4.7H10.4V3.1C12.5 4.1 14 6.4 14 9C14 10.7 13.4 12.2 13.4 13.4Z"
        fill={color}
      />
    </Svg>
  );
}

export function PersonIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M9 2C7.3 2 6 3.3 6 5C6 6.7 7.3 8 9 8C10.7 8 12 6.7 12 5C12 3.3 10.7 2 9 2ZM9 10C6.3 10 1 11.3 1 14V16H17V14C17 11.3 11.7 10 9 10Z"
        fill={color}
      />
    </Svg>
  );
}

export function ShieldCheckIcon({ color = '#C8914F', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M9 1L3 4V9C3 13 6 16 9 17C12 16 15 13 15 9V4L9 1Z" stroke={color} strokeWidth={1.6} strokeLinejoin="round" fill="none" />
      <Path d="M6 9L8 11L12 7" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function FamilyIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M9 3C5.7 3 3 4.5 3 6V12C3 13.5 5.7 15 9 15C12.3 15 15 13.5 15 12V6C15 4.5 12.3 3 9 3Z"
        fill={color}
      />
    </Svg>
  );
}

export function LocationPinIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={6} stroke={color} strokeWidth={1.5} strokeDasharray="2 2" fill="none" />
      <Circle cx={9} cy={9} r={2} stroke={color} strokeWidth={1.5} fill="none" />
    </Svg>
  );
}

export function SunLocationIcon({ color = '#C8914F', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={2} fill={color} />
      <Path
        d="M9 1V3M9 15V17M1 9H3M15 9H17M3.5 3.5L4.9 4.9M13.1 13.1L14.5 14.5M3.5 14.5L4.9 13.1M13.1 4.9L14.5 3.5"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export function StarIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M9 1L11 6L16 6L12 9L13 14L9 11L5 14L6 9L2 6L7 6Z" fill={color} />
    </Svg>
  );
}

export function SunriseIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  // Half-sun rising above a horizon line — breakfast
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M2 12H16" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Path d="M5.5 12A3.5 3.5 0 0 1 12.5 12" stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <Path d="M9 4V2.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M4.5 5.5L3.4 4.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M13.5 5.5L14.6 4.4" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M3 9H1.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
      <Path d="M15 9H16.5" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    </Svg>
  );
}

export function SunFullIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  // Full sun — lunch / midday
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={3} stroke={color} strokeWidth={1.6} fill="none" />
      <Path d="M9 2V3.5M9 14.5V16M2 9H3.5M14.5 9H16M4.1 4.1L5.2 5.2M12.8 12.8L13.9 13.9M4.1 13.9L5.2 12.8M12.8 5.2L13.9 4.1" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function CircleFillIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Circle cx={9} cy={9} r={7} fill={color} />
    </Svg>
  );
}

export function MoonIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M14 9C14 11.7 11.7 14 9 14C7.5 14 6.1 13.3 5.2 12.2C5.6 12.3 6 12.4 6.5 12.4C9.5 12.4 12 9.9 12 6.9C12 6.3 11.9 5.7 11.7 5.2C13 6.1 14 7.5 14 9Z"
        fill={color}
      />
    </Svg>
  );
}

export function CheckIcon({ color = '#27500A', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M3 7L6 10L11 4" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

export function SpeakerMuteIcon({ color = '#5F5E5A', size = 14 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M2 5V9H4L7 12V2L4 5H2Z" stroke={color} strokeWidth={1.5} fill={color} />
      <Path d="M10 4L13 7M13 4L10 7" stroke={color} strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

export function ForkPlateIcon({ color = '#5A9E35', size = 44 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Circle cx={24} cy={24} r={14} fill="none" stroke={color} strokeWidth={2.5} />
      <Circle cx={24} cy={24} r={9} fill="none" stroke={color} strokeWidth={1.5} />
      <Path
        d="M14 6 L14 13 M11 6 L11 13 M17 6 L17 13 M14 13 L14 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M34 6 C36 6 37 8 37 12 L37 18 L34 18 L34 22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

export function PillIcon({ color = '#C8914F', size = 32 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Rect x={4} y={12} width={24} height={8} rx={4} fill={color} />
      <Line x1={16} y1={12} x2={16} y2={20} stroke="white" strokeWidth={1.5} />
    </Svg>
  );
}

export function ClockTimingIcon({ color = '#8B6E52', size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path
        d="M9 2C5.1 2 2 5.1 2 9C2 12.9 5.1 16 9 16C12.9 16 16 12.9 16 9C16 5.1 12.9 2 9 2ZM9 4C11.8 4 14 6.2 14 9C14 11.8 11.8 14 9 14C6.2 14 4 11.8 4 9C4 6.2 6.2 4 9 4ZM8 5V9.4L11.6 11.6L12.4 10.2L9.5 8.5V5H8Z"
        fill={color}
      />
    </Svg>
  );
}
