// Optional scene metadata for Replit workspace integrations. When the
// workspace's scene controls are enabled for this project, a viewer's click on
// a scene segment scopes their next chat request to that scene's source file.
// Fill one entry per SCENE_DURATIONS key in VideoTemplate.tsx only when a
// skill reference asks for it; otherwise leave the map empty. Scenes missing
// from the map still play and can be jumped to.
//
// Example:
//   export const SCENE_DETAILS: Record<string, SceneDetails> = {
//     open: { title: 'Intro', filePath: 'src/components/video/video_scenes/Scene1.tsx' },
//   };

export interface SceneDetails {
  title: string;
  filePath: string;
}

export const SCENE_DETAILS: Record<string, SceneDetails> = {
  boundary: { title: 'The Boundary', filePath: 'src/components/video/BoundaryScene.tsx' },
  token: { title: 'Signed and Scoped', filePath: 'src/components/video/TokenScene.tsx' },
  redis: { title: 'Session State', filePath: 'src/components/video/RedisScene.tsx' },
  scope: { title: 'Tenant Scope', filePath: 'src/components/video/TenantScopeScene.tsx' },
  roles: { title: 'Roles and Limits', filePath: 'src/components/video/RoleScene.tsx' },
  rotation: { title: 'Token Rotation', filePath: 'src/components/video/RotationScene.tsx' },
  overview: { title: 'Project Overview', filePath: 'src/components/video/OverviewScene.tsx' },
};
