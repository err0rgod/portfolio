# err0rgod Portfolio

A minimal, terminal-inspired personal portfolio for **Nirbhay Katiyar (`err0rgod`)** — software developer, security researcher, and cloud-native backend engineer.

The site is built with plain HTML and CSS, with no framework or build step. It highlights selected projects across backend engineering, security tooling, Python libraries, cloud/serverless platforms, and network analysis.

## Live Site

This repository is designed to be hosted with GitHub Pages.

## Pages

- `index.html` — landing page with about, featured projects, and contact links
- `projects.html` — detailed project breakdowns with stack, highlights, usage snippets, and links

## Featured Projects

- **FlexURL** — production URL management platform using FastAPI, PostgreSQL, Redis, Snowflake IDs, analytics, and Nginx
- **ZeroDaily** — serverless AI-powered cybersecurity newsletter platform on AWS Lambda
- **tokenly-auth** — database-agnostic Python authentication/session toolkit using Argon2id and JWTs
- **revlimiter** — zero-dependency Python rate-limiting library with token bucket and leaky bucket algorithms
- **nascar** — multi-threaded network scanner with ARP/ICMP host discovery and TTL-based OS fingerprinting
- **MidAnalyzer** — browser-based PCAP analyzer built with Streamlit and Docker
- **blackwidow** — ATtiny85 HID security research device for studying physical-access attack vectors

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript-free static pages
- GitHub Pages-ready deployment
- Responsive layout with a dark, monospace terminal aesthetic

## Run Locally

No dependencies are required.

```bash
git clone https://github.com/err0rgod/portfolio.git
cd portfolio
```

Open `index.html` directly in a browser, or serve the folder locally:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Repository Structure

```text
.
├── index.html      # Main portfolio page
├── projects.html   # Detailed project showcase
└── README.md       # Project documentation
```

## Deployment

The site can be deployed through GitHub Pages:

1. Open the repository settings on GitHub.
2. Go to **Pages**.
3. Select the default branch as the source.
4. Save and wait for GitHub Pages to publish the static site.

Because the project is fully static, no build command or runtime server is needed.

## Notes

Some listed projects are security research tools. They are presented for educational, defensive, and authorized testing contexts only. Use security tooling only on systems and networks you own or have explicit permission to assess.

## Author

**Nirbhay Katiyar** / [`err0rgod`](https://github.com/err0rgod)

- GitHub: <https://github.com/err0rgod>
- LinkedIn: <https://linkedin.com/in/nirbhay-katiyar>
- Medium: <https://err0rgod.medium.com>
