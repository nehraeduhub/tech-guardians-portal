import { readSetting, publishSetting } from '@/lib/shared-settings';
export interface AboutVisibilitySettings {
  headerVisible: boolean;
  footerVisible: boolean;
}

const ABOUT_VISIBILITY_KEY = 'tg_about_visibility';

export const DEFAULT_ABOUT_VISIBILITY: AboutVisibilitySettings = {
  headerVisible: true,
  footerVisible: true,
};

export const loadAboutVisibility = (): AboutVisibilitySettings => ({
  ...DEFAULT_ABOUT_VISIBILITY,
  ...readSetting<Partial<AboutVisibilitySettings>>(ABOUT_VISIBILITY_KEY, {}),
});

export const saveAboutVisibility = (settings: AboutVisibilitySettings) => publishSetting(ABOUT_VISIBILITY_KEY, settings);
