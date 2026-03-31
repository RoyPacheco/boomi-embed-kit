/**
 * EmbedKit UI configuration passed to BoomiPlugin().
 * Mirrors the structure from the official embedkit-examples repo.
 */
const boomiConfig = {
  enableAi: true,
  theme: {
    allowThemes: true,
    defaultTheme: 'light',
    primaryColor: '#1565C0',
    fontFamily: 'Inter, sans-serif',
  },
  components: {
    integrationsDashboard: {
      integrations: {
        showHeader: false,
        defaultView: 'table',
        integration: {
          showControls: false,
        },
      },
    },
    integrationsPage: {
      integrations: {
        showHeader: true,
        defaultView: 'grid',
        header: {
          showTitle: false,
          showDescription: false,
        },
      },
      mapping: {
        useTreeMode: true,
      },
    },
  },
}

export default boomiConfig
