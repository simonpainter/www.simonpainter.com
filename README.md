# Simon Painter's Website

Welcome to the repository for my personal website - a place where I share insights, solutions, and discoveries from my journey through cloud networking, infrastructure automation, and everything in between. This site started as my own digital notebook but has grown into a resource for anyone navigating the transition from traditional networking to the cloud.

## Contributing to This Site

I'd love for you to contribute! Whether you've spotted a typo, want to suggest improvements, or have your own insights to share, here's how you can get involved:

### How to Contribute

1. **Fork this repository** - Click the "Fork" button at the top right of this page
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/www.simonpainter.com.git
   cd www.simonpainter.com
   ```
3. **Create a new branch** for your changes:
   ```bash
   git checkout -b your-feature-branch
   ```
4. **Make your changes** - Whether it's fixing content, adding new posts, or improving the site
5. **Test your changes** locally (see Development section below)
6. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   git push origin your-feature-branch
   ```
7. **Create a Pull Request** - Go back to the main repository and click "New Pull Request"

### What You Can Contribute

- **Content improvements** - Fix typos, clarify explanations, or suggest better approaches
- **New blog posts** - Share your own technical insights (following our content guidelines)
- **Technical improvements** - Enhance the site's functionality or design
- **Documentation** - Help improve these contribution guidelines or add missing docs

### Content Guidelines

When writing content for this site, I follow these principles:
- Use UK English spellings and grammar
- Keep it conversational - like two friends chatting over coffee
- Avoid buzzwords and use plain English
- Use first-person singular (I, my, me) to keep it personal
- Include practical examples and real-world applications
- Support claims with specific data when possible

The full content guidelines can be found in `.github/copilot-instructions.md`.

## About Simon

I'm Simon Painter, a Cloud Network Architect and Microsoft MVP for Cloud and Datacenter Management - On-Premises Networking. With over two decades of experience in enterprise-scale cloud and network infrastructure, I've spent my career helping organisations navigate the shift from traditional networking to cloud-first architectures.

My journey started in traditional network engineering, working across retail, finance, and enterprise technology environments. But like many of us, I found myself deep in the cloud transformation wave, specialising in multi-cloud networking, hybrid connectivity, and infrastructure automation. The more I learned, the more I realised that cloud networking isn't just traditional networking with a fancy interface - it's its own discipline with unique challenges and opportunities.

This blog started selfishly as my digital notebook - a place to document solutions so I wouldn't have to solve the same problems twice. But it's grown into something more: a resource for others making the same journey from network cables to cloud configs. Being recognised as a Microsoft MVP feels like validation that this approach of sharing what we learn actually helps people.

When I'm not working with networks and clouds, I enjoy making things - whether through 3D printing, building intricate Lego creations, or exploring new technologies. Based in Yorkshire, I share my life with my wife, three children, and our spaniel, Mabel.

## What You'll Find Here

This site serves as a platform for sharing practical insights about:

- **Cloud networking** - AWS, Azure, and multi-cloud connectivity solutions
- **Infrastructure automation** - Terraform, CI/CD, and infrastructure as code
- **Network modernisation** - Moving from traditional to cloud-first architectures  
- **Security best practices** - Securing cloud and hybrid environments
- **Real-world solutions** - Practical approaches to common (and uncommon) problems

The content focuses on bridging the gap between traditional networking knowledge and modern cloud practices, with a heavy emphasis on practical implementation over theoretical concepts.

## Technical Implementation

The site is built using modern tools and practices:

- **Docusaurus 3.x** - React-based static site generator for fast, responsive performance
- **GitHub Actions** - Automated build testing and deployment pipeline
- **Markdown content** - All posts written in Markdown for easy editing and version control
- **Tag organisation** - Content organised by technology areas for easy discovery
- **Responsive design** - Optimised for desktop, tablet, and mobile viewing
- **Dark mode support** - Full support for light and dark themes

## Development

Want to run the site locally? Here's how:

```bash
# Install dependencies
npm install

# Start development server (with live reload)
npm start

# Build for production
npm run build

# Test the production build locally
npm run serve
```

The site includes automated GitHub Actions that will test your pull request builds, so you'll know immediately if something breaks. The development server provides live reloading, making it easy to see your changes as you write.

### Project Structure

- `blog/` - All blog posts in Markdown format
- `blog/authors.yml` - Author information and biographies  
- `src/` - Custom React components and pages
- `static/` - Static assets like images and files
- `docusaurus.config.js` - Site configuration and navigation
- `.github/workflows/` - GitHub Actions for testing and deployment

## Questions or Ideas?

Found something confusing? Have an idea for improvement? Want to contribute but not sure where to start? Feel free to:

- Open an issue to discuss your ideas
- Start a pull request with your proposed changes
- Reach out on [LinkedIn](https://www.linkedin.com/in/sipainter/) or [GitHub](https://github.com/simonpainter)

This site thrives on community input, and every contribution - no matter how small - makes it better for everyone.
