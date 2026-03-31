export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;

// Physics
export const GRAVITY = 1800; // pixels/s^2
export const VERLET_DAMPING = 0.999;
export const CONSTRAINT_ITERATIONS = 3;
export const WALL_RESTITUTION = 0.3;

// Spider
export const SPIDER_RADIUS = 12;

// Web
export const WEB_SPEED = 2000; // pixels/s for projectile
export const WEB_MAX_RANGE = 350;
export const WEB_THICKNESS = 2;
export const ROPE_LENGTH_MIN = 40;
export const ROPE_LENGTH_MAX = 250;

// Slingshot
export const SLINGSHOT_MAX_STRETCH = 120;
export const SLINGSHOT_FORCE = 18;
export const SLINGSHOT_DRAG_RADIUS = 150;

// Anchor selection weights
export const ANCHOR_WEIGHT_DIRECTION = 0.5;
export const ANCHOR_WEIGHT_DISTANCE = 0.2;
export const ANCHOR_WEIGHT_HEIGHT = 0.3;

// Camera
export const CAMERA_SPEED = 5.0;
export const CAMERA_LOOKAHEAD_X = 0.15;
export const CAMERA_LOOKAHEAD_Y = 0.3;
export const CAMERA_MAX_LOOKAHEAD = 200;

// Level
export const SHAFT_WIDTH = 400;
export const ZONE_HEIGHT = 5600; // 8 screens tall
export const DEATH_FLOOR_SPEED = 15; // pixels/s base speed
export const DEATH_FLOOR_OFFSET = 800; // pixels below camera

// Enemies
export const MOTH_RADIUS = 15;
export const WASP_RADIUS = 12;
export const WASP_SPEED = 120;
export const WEB_EATER_RADIUS = 10;
export const BIG_SPIDER_RADIUS = 40;

// Meta
export const SILK_PER_ZONE = 10;
export const WEB_CATCH_WINDOW = 0.4; // seconds to tap after being hit

// Colors
export const COLOR_BG = '#0a0a1a';
export const COLOR_SPIDER = '#e8e8e8';
export const COLOR_SPIDER_BODY = '#c0c0c0';
export const COLOR_WEB = '#ffffff';
export const COLOR_WEB_STRETCH = '#ff6644';
export const COLOR_ANCHOR = '#66ccff';
export const COLOR_ANCHOR_GLOW = 'rgba(102,204,255,0.3)';
export const COLOR_WALL = '#1a1a3a';
export const COLOR_MOTH = '#ccaa44';
export const COLOR_WASP = '#ff4444';
export const COLOR_WEB_EATER = '#44aa44';
export const COLOR_BIG_SPIDER = '#884488';
export const COLOR_DEATH_FLOOR = '#ff2200';
export const COLOR_SILK = '#ffcc00';
export const COLOR_HUD = '#ffffff';

// Zone themes
export interface ZoneTheme {
  name: string;
  bgTop: string;
  bgBottom: string;
  wallColor: string;
  anchorColor: string;
}

export const ZONE_THEMES: ZoneTheme[] = [
  { name: 'Jungle Canopy', bgTop: '#0d2b0d', bgBottom: '#1a4a1a', wallColor: '#2a3a1a', anchorColor: '#88cc44' },
  { name: 'Abandoned Factory', bgTop: '#1a1a2a', bgBottom: '#2a2a3a', wallColor: '#3a3a4a', anchorColor: '#8888aa' },
  { name: 'Crystal Cave', bgTop: '#0a1a2a', bgBottom: '#1a2a4a', wallColor: '#2a3a5a', anchorColor: '#44ccff' },
  { name: 'Storm Clouds', bgTop: '#1a1a2a', bgBottom: '#2a2a3a', wallColor: '#3a3a4a', anchorColor: '#ffcc44' },
];
