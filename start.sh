#!/bin/bash

# ============================================
# AI Game Balancing & Playtesting Agent
# Start Script
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${PURPLE}╔══════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║   🎮 AI Game Balancing & Playtesting Agent   ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Load .env
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

BACKEND_PORT=${BACKEND_PORT:-4000}
FRONTEND_PORT=${FRONTEND_PORT:-3001}
DB_NAME=${DB_NAME:-game_balancing_agent}

# ---- Step 1: Kill processes on used ports ----
echo -e "${YELLOW}[1/6] Cleaning up used ports...${NC}"

cleanup_port() {
  local port=$1
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo -e "  ${RED}Killing processes on port $port: $pids${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  else
    echo -e "  ${GREEN}Port $port is available${NC}"
  fi
}

cleanup_port $BACKEND_PORT
cleanup_port $FRONTEND_PORT

# ---- Step 2: Check PostgreSQL ----
echo -e "${YELLOW}[2/6] Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
  echo -e "${RED}PostgreSQL is not installed. Please install it first.${NC}"
  exit 1
fi

# Start PostgreSQL if not running
if ! pg_isready -q 2>/dev/null; then
  echo -e "  ${YELLOW}Starting PostgreSQL...${NC}"
  brew services start postgresql@14 2>/dev/null || pg_ctl start -D /opt/homebrew/var/postgresql@14 2>/dev/null || true
  sleep 2
fi
echo -e "  ${GREEN}PostgreSQL is running${NC}"

# ---- Step 3: Create database ----
echo -e "${YELLOW}[3/6] Setting up database...${NC}"
if ! psql -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "  ${CYAN}Creating database: $DB_NAME${NC}"
  createdb "$DB_NAME" 2>/dev/null || true
else
  echo -e "  ${GREEN}Database '$DB_NAME' already exists${NC}"
fi

# ---- Step 4: Install dependencies ----
echo -e "${YELLOW}[4/6] Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  echo -e "  ${CYAN}Installing backend dependencies...${NC}"
  npm install --silent 2>&1 | tail -1
fi

if [ ! -d "client/node_modules" ]; then
  echo -e "  ${CYAN}Installing frontend dependencies...${NC}"
  cd client && npm install --silent 2>&1 | tail -1 && cd ..
fi
echo -e "  ${GREEN}Dependencies ready${NC}"

# ---- Step 5: Seed database ----
echo -e "${YELLOW}[5/6] Seeding database with sample data...${NC}"
node server/seed.js
echo ""

# ---- Step 6: Start application with hot reload ----
echo -e "${YELLOW}[6/6] Starting application with hot reload...${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Application Starting!                       ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  Frontend:  http://localhost:${FRONTEND_PORT}              ║${NC}"
echo -e "${GREEN}║  Backend:   http://localhost:${BACKEND_PORT}              ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  Login:     admin@gamebalancer.com            ║${NC}"
echo -e "${GREEN}║  Password:  password123                       ║${NC}"
echo -e "${GREEN}║  (or click 'Auto-Fill Demo Credentials')      ║${NC}"
echo -e "${GREEN}║                                              ║${NC}"
echo -e "${GREEN}║  Press Ctrl+C to stop                        ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
echo ""

# Start backend with nodemon (hot reload) and frontend with vite (HMR)
npx concurrently \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "blue,magenta" \
  "npx nodemon --watch server server/index.js" \
  "cd client && npm run dev -- --host"
