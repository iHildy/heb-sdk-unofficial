# H-E-B MCP Server - Executive Summary

## What It Is

The H-E-B MCP Server is a bridge that connects AI assistants (like ChatGPT and Claude) directly to your H-E-B's account. It allows users to shop for groceries, manage their cart, check order history, and schedule deliveries, all through natural conversation with their AI assistant.

Think of it as enabling your AI to "log in" to H-E-B on your behalf and help you with grocery shopping tasks.

## Usage Examples

**Quick Shopping**

- "Add red grapes to my cart"  
- "Find organic milk and add it to my cart"

**Recipe-Based Shopping**

- "Add what I need for this recipe to my cart" (with a non H-E-B recipe URL)  
- "I want to make dinner for 4 people. Find weekly deals on meat and veggies."

**Meal Planning**

- "What should I order based on my order history?"  
- "Show me this week's promotions and add deal items I'd like to my cart"

**Scheduling**

- "What's the next available pickup time?"  
- "When can I get groceries delivered tomorrow?"

**Personalization**   
Most AI assistants can remember preferences ("I don't like green grapes") to make future shopping faster and more accurate with less user input.

## Key Features

### Shopping Capabilities

- **Product Search** – Find products by name, category, or keyword  
- **Product Details** – View prices, descriptions, availability, and nutrition info  
- **Cart Management** – Add items, update quantities, and remove products  
- **Quick Add** – Search and add the first matching result instantly

### Order & Delivery

- **Order History** – View past purchases and reorder favorites  
- **Delivery Scheduling** – Find available delivery time slots  
- **Curbside Pickup** – Check and reserve pickup windows  
- **Buy It Again** – Quickly repurchase frequently bought items

### Store Features

- **Weekly Ads** – Browse current promotions and deals  
- **Store Locator** – Find nearby H-E-B locations  
- **Shopping Lists** – Create and manage grocery lists  
- **Featured Items** – Discover homepage promotions and banners

## Technology Stack

- **Language:** TypeScript  
- **Protocol:** Model Context Protocol (MCP)  
- **Authentication:** Reverse Engineered H-E-B OAuth 2.0  
- **H-E-B Communication:** H-E-B GraphQL API  
- **MCP Communication:** HTTP Streaming  
- **Deployment:** Docker / Node.js

## Business Value

- **Convenience** – Shop for groceries through natural conversation  
- **Accessibility** – Voice-enabled shopping for all users  
- **Efficiency** – Quick reordering and cart management  
- **Revenue** – Instruct the AI to prefer own brand products  
- **Integration** – Works with popular AI assistants (ChatGPT, Claude, etc.)

## Example

Public Claude Chat: [https://claude.ai/share/a3e2868e-ca83-40e4-b916-1ecdebba8686](https://claude.ai/share/a3e2868e-ca83-40e4-b916-1ecdebba8686)

## Creator

Ian Hildebrand, a previous high-school intern at H-E-B built this project in 3 days. Having never built an MCP, no reverse-engineering skills, or using internal knowledge.  
LinkedIn: [https://www.linkedin.com/in/ian-hildebrand/](https://www.linkedin.com/in/ian-hildebrand/)