import { ThemeConfig, XmlFileItem } from '../types/theme';

/**
 * Escapes XML special characters for safety
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

/**
 * Generates official HyperOS description.xml
 */
export function generateDescriptionXml(theme: ThemeConfig): string {
  const cd = (v: string) => `<![CDATA[${v.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
  const { title, author, designer, version, description } = theme.meta;
  const locales = ['en_US', 'zh_CN'];
  const loc = (tag: string, v: string) => locales.map((l) => `<${tag} locale="${l}">${cd(v)}</${tag}>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<theme>
<version>${cd(version)}</version>
<uiVersion>17</uiVersion>
<author>${cd(author)}</author>
<designer>${cd(designer)}</designer>
<title>${cd(title)}</title>
<description>${cd(description)}</description>
<authors>
${loc('author', author)}
</authors>
<designers>
${loc('designer', designer)}
</designers>
<titles>
${loc('title', title)}
</titles>
<descriptions>
${loc('description', description)}
</descriptions>
<miuiAdapterVersion>3.2</miuiAdapterVersion>
</theme>`;
}

/**
 * Generates HyperOS lockscreen manifest.xml
 */
export function generateLockscreenManifest(theme: ThemeConfig): string {
  const { lockscreen } = theme;
  const isCenter = lockscreen.clockPosition === 'center';
  const isLeft = lockscreen.clockPosition === 'left';
  const clockX = isLeft ? 120 : 540;
  const clockAlign = isLeft ? 'left' : 'center';
  const clockY = isCenter ? 720 : 360;
  const fontSize = Math.round(140 * lockscreen.clockSize);

  return `<?xml version="1.0" encoding="UTF-8"?>
<Lockscreen version="1" frameRate="30" screenWidth="1080">
  <!-- HyperOS Dynamic Lockscreen Engine Manifest -->
  <Var name="clock_color" expression="'${lockscreen.clockColor}'" type="string" />
  <Var name="clock_style" expression="'${lockscreen.clockStyle}'" type="string" />
  <Var name="depth_enabled" expression="${lockscreen.depthEffect ? 1 : 0}" type="number" />
  <Var name="signature_text" expression="'${escapeXml(lockscreen.customSignature)}'" type="string" />

  <!-- Background Wallpaper Layer -->
  <Wallpaper />

  <!-- Depth Effect Wallpaper Cutout Layer (HyperOS Magazine Engine) -->
  ${
    lockscreen.depthEffect
      ? `<Group name="depth_cutout_layer" visibility="#depth_enabled">
    <Image x="0" y="0" src="depth_subject.png" />
  </Group>`
      : ''
  }

  <!-- Time & Magazine Typography Layer -->
  <Group name="clock_root">
    <!-- Big Digital/Magazine Clock Hour & Minute -->
    <DateTime x="${clockX}" y="${clockY}" align="${clockAlign}" format="HH:mm" color="${lockscreen.clockColor}" size="${fontSize}" fontStyle="bold" />

    <!-- Date & Calendar Indicator -->
    ${
      lockscreen.showDate
        ? `<DateTime x="${clockX}" y="${clockY + Math.round(fontSize * 0.72)}" align="${clockAlign}" format="E, MMMM d" color="${lockscreen.clockColor}" alpha="210" size="28" />`
        : ''
    }

    <!-- Custom Signature / Device Owner Branding -->
    ${
      lockscreen.customSignature
        ? `<Text x="${clockX}" y="${clockY + Math.round(fontSize * 0.72) + 42}" align="${clockAlign}" text="${escapeXml(lockscreen.customSignature)}" color="#94a3b8" size="18" />`
        : ''
    }
  </Group>

  <!-- Lockscreen Quick Shortcuts (Flashlight & Camera) -->
  <Group name="bottom_shortcuts">
    <Button name="left_shortcut" x="100" y="2180" w="100" h="100">
      <Normal>
        <Rectangle x="0" y="0" w="100" h="100" cornerRadius="50" fillColor="#1f2937" alpha="180" />
        <Image x="30" y="30" w="40" h="40" src="icons/torch.png" />
      </Normal>
    </Button>

    <Button name="right_shortcut" x="880" y="2180" w="100" h="100">
      <Normal>
        <Rectangle x="0" y="0" w="100" h="100" cornerRadius="50" fillColor="#1f2937" alpha="180" />
        <Image x="30" y="30" w="40" h="40" src="icons/camera.png" />
      </Normal>
    </Button>
  </Group>

  <!-- Swipe-up unlock: touch area at the bottom, 200px upward swipe -->
  <Button x="0" y="2050" w="1080" h="350">
    <Triggers>
      <Trigger action="down">
        <VariableCommand name="start_y" expression="#touch_y" />
      </Trigger>
      <Trigger action="up,cancel">
        <ExternCommand command="unlock" condition="ge(#start_y - #touch_y, 200)" />
      </Trigger>
    </Triggers>
  </Button>
</Lockscreen>`;
}

export function generateIconsManifest(theme: ThemeConfig): string {
  const { icons } = theme;
  // Icon canvas is 90 units; keep the glyph inside a margin derived from scale.
  const m = Math.max(0, Math.min(20, Math.round(((1 - icons.scale) * 45 + 12) * 10) / 10));
  const hi = 90 - m;
  return `<?xml version="1.0" encoding="UTF-8"?>
<IconTransform>
  <PointsMapping>
    <Point fromX="0.0" fromY="0.0" toX="${m}" toY="${m}"/>
    <Point fromX="0.0" fromY="90.0" toX="${m}" toY="${hi}"/>
    <Point fromX="90.0" fromY="90.0" toX="${hi}" toY="${hi}"/>
    <Point fromX="90.0" fromY="0.0" toX="${hi}" toY="${m}"/>
  </PointsMapping>
  <IconFilters>
    <Filter name="Hsl">
      <Param name="SaturationModify" value="1.0" />
      <Param name="LightnessModify" value="0.0" />
    </Filter>
  </IconFilters>
</IconTransform>`;
}

/**
 * Generates com.android.systemui theme_values.xml
 */
export function generateSystemUiManifest(theme: ThemeConfig): string {
  const { systemUi } = theme;
  const argb = (hex: string) => {
    const h = hex.replace('#', '');
    return h.length === 6 ? `#FF${h.toUpperCase()}` : `#${h.toUpperCase()}`;
  };
  const accent = argb(systemUi.accentColor);
  return `<?xml version="1.0" encoding="utf-8"?>
<MIUI_Theme_Values template="LightTemplate">
<!-- ===== BATTERY ===== -->
<color name="status_bar_battery_text_color">#FFFFFFFF</color>
<color name="status_bar_battery_charging_color">${accent}</color>

<!-- ===== CONTROL CENTER ===== -->
<color name="qs_tile_bg_on_color">${accent}</color>
<dimen name="qs_corner_radius">24dp</dimen>
<bool name="config_enable_blur">${systemUi.controlCenterBlur > 0 ? 'true' : 'false'}</bool>

<!-- ===== NOTIFICATION ===== -->
<color name="notification_background_color">${argb(systemUi.notificationBgColor || '#1E293B')}</color>
<color name="notification_text_color">#FFFFFFFF</color>
<color name="notification_secondary_text_color">#B3FFFFFF</color>

<!-- ===== NAVIGATION ===== -->
<color name="navigation_bar_home_handle_dark_color">#80FFFFFF</color>
<color name="navigation_bar_home_handle_light_color">#80FFFFFF</color>
</MIUI_Theme_Values>`;
}

/**
 * Generates com.miui.home theme_values.xml (Launcher layout)
 */
export function generateMiuiHomeXml(theme: ThemeConfig): string {
  const argb = (hex: string) => {
    const h = hex.replace('#', '');
    return h.length === 6 ? `#FF${h.toUpperCase()}` : `#${h.toUpperCase()}`;
  };
  return `<?xml version="1.0" encoding="utf-8"?>
<MIUI_Theme_Values template="LightTemplate">
<color name="workspace_icon_text_color">${argb(theme.icons.labelColor)}</color>
<color name="icon_title_text_dark">${argb(theme.icons.labelColor)}</color>
<color name="search_bar_stroke_color_dark">#14FFFFFF</color>
<color name="search_bar_stroke_color_light">#14000000</color>
<dimen name="config_icon_width_and_height">${Math.round(56 * theme.icons.scale)}dp</dimen>
</MIUI_Theme_Values>`;
}

/**
 * Returns all generated theme files as a collection
 */
export function getAllGeneratedThemeFiles(theme: ThemeConfig): XmlFileItem[] {
  return [
    {
      path: 'description.xml',
      displayName: 'description.xml (Theme Metadata)',
      content: generateDescriptionXml(theme),
      category: 'metadata',
    },
    {
      path: 'lockscreen/advance/manifest.xml',
      displayName: 'lockscreen/advance/manifest.xml (Lock Engine)',
      content: generateLockscreenManifest(theme),
      category: 'lockscreen',
    },
    {
      path: 'icons/transform_config.xml',
      displayName: 'icons/transform_config.xml (Icon Transform)',
      content: generateIconsManifest(theme),
      category: 'icons',
    },
    {
      path: 'com.android.systemui/theme_values.xml',
      displayName: 'com.android.systemui/theme_values.xml (Control Center)',
      content: generateSystemUiManifest(theme),
      category: 'systemui',
    },
    {
      path: 'com.miui.home/theme_values.xml',
      displayName: 'com.miui.home/theme_values.xml (Launcher Desktop)',
      content: generateMiuiHomeXml(theme),
      category: 'home',
    },
    {
      path: 'framework-miui-res/theme_values.xml',
      displayName: 'framework-miui-res/theme_values.xml (System Framework Tokens)',
      content: generateFrameworkResXml(theme),
      category: 'systemui',
    },
  ];
}

/**
 * Generates framework-res theme_values.xml for HyperOS global UI tokens
 */
export function generateFrameworkResXml(theme: ThemeConfig): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<MIUI_Theme_Values template="LightTemplate">
<!-- Global framework tokens; add real framework-miui-res keys here as needed. -->
</MIUI_Theme_Values>`;
}
