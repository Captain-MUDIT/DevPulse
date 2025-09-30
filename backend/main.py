"""
main.py
Enrty point of the project
"""

import logging
from src import run_pipeline

logging.basicConfig(level=logging.INFO)

def main():
    logging.info("Starting Devpulse News Pipeline...")
    run_pipeline()
    logging.info("DevPulse Pipeline finished succesfully")
    
if __name__ == "__main__":
    main()
    