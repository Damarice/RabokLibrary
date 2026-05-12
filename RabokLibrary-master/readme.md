# Raboks Library Research & Development Center Website

A minimalist, elegant website for an academic research institution featuring clean design, responsive layout, and smooth animations.

## 🎨 Design Philosophy

- **Minimalist Aesthetic**: Clean lines, ample whitespace, and sophisticated typography
- **Academic Elegance**: Professional color scheme with cream backgrounds and muted grays
- **Accessibility First**: WCAG compliant with proper semantic HTML and ARIA labels
- **Mobile Responsive**: Optimized for all device sizes and screen resolutions

## 📁 Project Structure

### Pages
- **`index.html`**: Main homepage with research areas, services, and featured content
- **`publications.html`**: Dedicated publications page with search, filtering, and detailed listings

### Assets
- **`logo.svg`**: Custom Raboks Library logo in scalable vector format
- **`images/`**: Directory containing research area illustrations and background graphics

### Functionality
- **`script.js`**: Core JavaScript for navigation, animations, and interactions
- **`publications.js`**: Publications-specific functionality including search and filtering

```
raboks-library-website/
├── index.html          # Main HTML file with semantic structure
├── publications.html   # Publications page with search and filtering
├── styles.css          # Complete stylesheet with comprehensive comments
├── script.js           # Main JavaScript functionality and interactions
├── publications.js     # Publications page specific functionality
├── logo.svg            # Raboks Library logo in SVG format
├── images/             # Image assets directory
│   ├── hero-bg.svg     # Hero section background pattern
│   ├── data-science.svg # Data sciences research illustration
│   ├── biology.svg     # Biology research illustration
│   └── materials.svg   # Materials research illustration
└── README.md           # Project documentation (this file)
```

## 🚀 Features

### Design Features
- **Elegant Typography**: Helvetica Neue font family for professional appearance
- **Sophisticated Color Palette**: Cream (#f5f5f0) and gray tones for academic feel
- **Custom Logo**: SVG-based institutional branding with clean design
- **Visual Content**: Custom illustrations for research areas and backgrounds
- **Subtle Animations**: Smooth transitions and hover effects
- **Card-based Layout**: Clean content organization with visual hierarchy

### Technical Features
- **Multi-page Architecture**: Main site and dedicated publications page
- **Semantic HTML5**: Proper document structure with ARIA labels
- **CSS Custom Properties**: Maintainable color and spacing system
- **SVG Graphics**: Scalable vector graphics for crisp visuals
- **Search & Filter**: Advanced publications search and filtering system
- **Intersection Observer**: Performance-optimized scroll animations
- **Responsive Grid**: CSS Grid and Flexbox for flexible layouts
- **Smooth Scrolling**: Enhanced navigation experience

### Accessibility Features
- **Keyboard Navigation**: Full keyboard accessibility support
- **Screen Reader Support**: Proper ARIA labels and semantic structure
- **Focus Indicators**: Visible focus states for all interactive elements
- **High Contrast**: Sufficient color contrast ratios

## 🛠️ Customization Guide

### Colors
Edit the CSS custom properties in `styles.css`:

```css
:root {
    --bg-cream: #f5f5f0;          /* Main background */
    --bg-white: #ffffff;          /* Card backgrounds */
    --text-primary: #6b6b6b;      /* Primary text */
    --text-dark: #4a4a4a;         /* Headings */
    --text-light: #9a9a9a;        /* Secondary text */
    --border-gray: #d4d4d4;       /* Borders */
}
```

### Typography
Modify font settings in the `:root` section:

```css
:root {
    --font-family-primary: 'Helvetica Neue', 'Arial', sans-serif;
    --font-weight-light: 300;
    --font-weight-normal: 400;
}
```

### Spacing
Adjust the spacing system:

```css
:root {
    --spacing-xs: 8px;
    --spacing-sm: 16px;
    --spacing-md: 24px;
    --spacing-lg: 32px;
    --spacing-xl: 48px;
    --spacing-xxl: 80px;
}
```

## 📱 Responsive Breakpoints

- **Desktop**: 1400px max-width container
- **Tablet**: 768px and below
- **Mobile**: 480px and below

## 🖼️ Visual Assets

### Logo Design
The Raboks Library logo is implemented as an SVG for crisp display at all sizes:
- **Format**: Scalable Vector Graphics (SVG)
- **Style**: Minimalist frame with elegant typography
- **Colors**: Matches the site's muted color palette
- **Usage**: Automatically scales for different screen sizes

### Research Area Illustrations
Custom SVG illustrations for each research area:
- **Data Sciences**: Abstract data visualization elements
- **Systems Biology**: DNA helix and molecular structures  
- **Materials Research**: Crystal lattice patterns
- **Style**: Consistent with overall design aesthetic

### Background Graphics
- **Hero Background**: Subtle academic-themed pattern with mathematical symbols
- **Opacity**: Low opacity overlay for text readability
- **Performance**: Optimized SVG for fast loading

## 📄 Publications System

### Search Functionality
- **Real-time Search**: Instant results as you type
- **Multi-field Search**: Searches titles, authors, and journals
- **Highlighting**: Search terms highlighted in results
- **Debounced Input**: Optimized performance with delayed search execution

### Filtering Options
- **Category Filter**: Journal articles, conference papers, reports, books, working papers
- **Year Filter**: Filter by publication year
- **Combined Filters**: Multiple filters work together
- **Results Count**: Shows number of matching publications

### Publication Display
- **Organized by Year**: Publications grouped chronologically
- **Rich Metadata**: Authors, journals, publication types, dates
- **Action Links**: Abstract, PDF download, citation links
- **Load More**: Pagination for large publication lists

## 🔧 Development Setup

1. **Clone or download** the project files
2. **Open index.html** in a web browser
3. **Edit files** using any text editor or IDE
4. **Test responsiveness** using browser developer tools

### Local Development Server (Optional)

For better development experience, use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (http-server)
npx http-server

# Using PHP
php -S localhost:8000
```

## 📝 Content Management

### Adding New Research Areas

1. **HTML**: Add new `<article>` element in the research grid
2. **Icon**: Choose appropriate emoji or replace with image
3. **Content**: Update title, description, and meta information

Example:
```html
<article class="research-card" tabindex="0" role="button">
    <div class="research-image" aria-hidden="true">
        🔬
    </div>
    <div class="research-content">
        <h3 class="research-title">Your Research Area</h3>
        <p class="research-description">Description of the research area...</p>
        <div class="research-meta">Department Name</div>
    </div>
</article>
```

### Adding New Services

Follow the same pattern in the services grid:
```html
<div class="service-card">
    <span class="service-icon">📚</span>
    <div class="service-title">Service Name</div>
    <p class="service-description">Service description...</p>
</div>
```

### Updating Navigation

Modify the navigation links in the header:
```html
<ul class="nav-links">
    <li><a href="#section-id">Section Name</a></li>
</ul>
```

## 🎯 Performance Optimization

### CSS Optimization
- **Custom Properties**: Centralized theming system
- **Efficient Selectors**: Minimal specificity conflicts
- **Mobile-First**: Responsive design approach

### JavaScript Optimization
- **Event Delegation**: Efficient event handling
- **Intersection Observer**: Performance-optimized animations
- **Throttled Scroll Events**: Smooth scroll performance

### Loading Optimization
- **Preload Resources**: Critical CSS and JS files
- **Semantic HTML**: Fast initial render
- **Minimal Dependencies**: No external frameworks

## 🔍 SEO Features

- **Semantic HTML5**: Proper document structure
- **Meta Tags**: Title, description, and Open Graph tags
- **Heading Hierarchy**: Logical H1-H6 structure
- **Alt Text**: Descriptive text for images (when added)

## 🌐 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **CSS Grid**: Full support in all modern browsers
- **Intersection Observer**: Supported with polyfill fallback
- **CSS Custom Properties**: Native support in modern browsers

## 📋 Maintenance Checklist

### Regular Updates
- [ ] Update content and research information
- [ ] Check for broken links
- [ ] Validate HTML and CSS
- [ ] Test accessibility features
- [ ] Optimize images and assets

### Performance Monitoring
- [ ] Check page load speeds
- [ ] Validate responsive design
- [ ] Test JavaScript functionality
- [ ] Monitor browser console for errors

## 🤝 Contributing

When making changes to the project:

1. **Maintain Code Style**: Follow existing patterns and commenting
2. **Test Responsiveness**: Verify changes work on all screen sizes
3. **Check Accessibility**: Ensure WCAG compliance
4. **Update Documentation**: Modify README if adding new features

## 📄 License

This project is designed for the Raboks Library Research & Development Center. Modify and adapt as needed for your institution.

## 📞 Support

For questions about implementation or customization:
- Review the comprehensive comments in `styles.css` and `script.js`
- Check browser developer tools for debugging
- Validate HTML and CSS using online validators

---

**Built with care for academic excellence and user experience.**

## 🔍 Peer Review & Research Repository System

### Overview
The Peer Review & Research Repository is a comprehensive academic submission and review platform that extends Raboks Library's capabilities to include:

- **Verified Researcher Authentication**: Secure login system for academic professionals
- **Manuscript Submission Workflow**: Multi-step submission process with validation
- **Peer Review Management**: Assignment, tracking, and completion of reviews
- **Version Control**: Document management with revision history
- **Author Attribution**: Clear authorship and collaboration tracking
- **Repository Browsing**: Public access to published research

### Key Features

#### Authentication System
- **Researcher Registration**: Verification process for academic credentials
- **Institution Validation**: Email verification from accredited institutions
- **ORCID Integration**: Optional ORCID ID for researcher identification
- **Role-based Access**: Different permissions for authors, reviewers, and editors

#### Submission Workflow
- **5-Step Process**: Guided manuscript submission with validation
- **File Upload**: Support for manuscripts, figures, and supplementary materials
- **Author Management**: Add multiple co-authors with full attribution
- **Review Preferences**: Suggest or exclude specific reviewers
- **Compliance Checks**: Ethics, originality, and copyright agreements

#### Dashboard Features
- **Personal Dashboard**: Overview of submissions, reviews, and publications
- **Status Tracking**: Real-time updates on manuscript progress
- **Review Assignments**: Manage peer review responsibilities
- **Collaboration Tools**: Work with co-authors and research teams
- **Manuscript Management**: Version control and document organization

#### Repository System
- **Public Access**: Browse published research without authentication
- **Advanced Search**: Multi-field search with filtering options
- **Metrics Tracking**: View counts, downloads, and citations
- **Export Options**: Download PDFs and citation formats
- **Categorization**: Organized by field, type, and publication year

### Technical Implementation

#### Frontend Architecture
- **Responsive Design**: Mobile-first approach with academic standards
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support
- **Performance**: Optimized loading with lazy loading and caching

#### Security Features
- **Data Protection**: Encrypted storage and transmission
- **Access Control**: Role-based permissions and authentication
- **Audit Trail**: Complete logging of all system activities
- **Backup Systems**: Regular automated backups of all submissions

#### Integration Points
- **Main Library**: Seamless navigation between library and peer review
- **Publications Page**: Direct links to peer-reviewed content
- **User Profiles**: Unified identity across all library services
- **Search Integration**: Cross-platform search capabilities

### Academic Standards Compliance

#### Editorial Workflow
- **Double-Blind Review**: Anonymous review process options
- **Editorial Board**: Structured review assignment system
- **Quality Control**: Multi-stage validation and approval process
- **Ethics Compliance**: Built-in ethics and plagiarism checking

#### Publication Standards
- **Metadata Standards**: Dublin Core and academic metadata schemas
- **Citation Formats**: Support for major citation styles
- **DOI Integration**: Digital Object Identifier assignment
- **Open Access**: Flexible licensing and access options

### Usage Guidelines

#### For Authors
1. **Registration**: Create verified researcher account
2. **Submission**: Follow 5-step submission process
3. **Review**: Respond to reviewer comments and revisions
4. **Publication**: Final approval and publication process

#### For Reviewers
1. **Assignment**: Receive review invitations based on expertise
2. **Evaluation**: Comprehensive review using structured forms
3. **Feedback**: Provide detailed comments and recommendations
4. **Follow-up**: Track author responses and final decisions

#### For Administrators
1. **User Management**: Verify researcher credentials and manage access
2. **Editorial Oversight**: Assign editors and manage review process
3. **Quality Assurance**: Monitor system performance and content quality
4. **Reporting**: Generate analytics and performance reports

### Future Enhancements

#### Planned Features
- **AI-Assisted Review**: Automated initial screening and matching
- **Blockchain Verification**: Immutable record of review process
- **Mobile Applications**: Native iOS and Android apps
- **API Integration**: Connect with external research databases
- **Advanced Analytics**: Detailed metrics and impact tracking

#### Scalability Considerations
- **Cloud Infrastructure**: Scalable hosting and storage solutions
- **Load Balancing**: Handle high-volume submission periods
- **Database Optimization**: Efficient querying and indexing
- **CDN Integration**: Global content delivery for faster access

This peer review system represents a significant expansion of Raboks Library's mission to advance scholarly communication through rigorous academic standards and modern technology.