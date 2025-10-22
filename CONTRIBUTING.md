# Contributing to Crouton

To contribute to crouton, fork, make your changes and send a pull request to the main branch.

Take a look at the issues for bugs that you might be able to help fix.

Once your pull request is merged it will be released in the next version.

## Development Setup

### Quick Start

1. **Install dependencies and start development environment:**
   ```bash
   make all    # Install PHP and Node.js dependencies, build assets
   make dev    # Start WordPress development environment (port 8080)
   ```

2. **Access your development site:**
   - WordPress: http://localhost:8080
   - WordPress admin: http://localhost:8080/wp-admin
   - Remember your admin password and activate the "crouton" plugin

3. **Watch for changes during development:**
   ```bash
   make js-watch    # Watch and rebuild JavaScript/CSS on changes
   ```

### Common Development Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make dev` | Start WordPress development environment |
| `make js-watch` | Watch and rebuild JavaScript/CSS assets |
| `make js-build` | Build JavaScript/CSS assets once |
| `make lint` | Run PHP code style checks |
| `make fmt` | Fix PHP code style issues |
| `make build` | Build distributable plugin zip |
| `make clean` | Clean build artifacts |

### Development Workflow

1. **PHP Changes**: Edit PHP files directly - changes take effect immediately
2. **JavaScript/CSS Changes**: Run `make js-watch` to automatically rebuild assets when you modify files in `croutonjs/src/`
3. **Testing**: Use the WordPress admin interface to test plugin functionality

### Code Standards

Please adhere to the `.editorconfig` file to minimize formatting errors:
- **PHP**: 4 spaces, LF line endings, PSR1/PSR2 standards
- **JavaScript/Handlebars**: Tabs (4 width), LF line endings
- **JSON**: 2 spaces

If using PHPStorm, install the EditorConfig plugin.

## HTTPS Testing

You can use [ngrok](https://ngrok.com) to test HTTPS-related functionality:

1. Start ngrok: `ngrok http 8080`
2. Set the HTTPS URL in WordPress:
   ```bash
   make ngrok-setup NGROK_URL="https://your-ngrok-url.ngrok.io"
   ```

## Database Access

- **Connect to database**: `make mysql`
- **Access container shell**: `make bash`

## Release Process

### Version Bumping Checklist

Before creating a release, update the version number in these files:

1. **`readme.txt`**:
   - Update `Stable tag:` line (near line 8)
   - Add new version entry in `== Changelog ==` section with release notes

2. **`crouton.php`**:
   - Update `Version:` in the plugin header comment (line 8)

3. **`croutonjs/src/js/crouton-core.js`**:
   - Update `version:` in config object (line 18)

**Example:**
```php
// In crouton.php header
Version: 3.26.0
```

```javascript
// In crouton-core.js
version: '3.26.0';
```

### Tagging Releases

If a release is tagged with `beta`, it will be pushed to a zip in GitHub releases. Otherwise, it will go to the WordPress directory as a release in addition to GitHub.
