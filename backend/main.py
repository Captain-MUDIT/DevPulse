"""
main.py
Entry point of the project
"""

import logging
import argparse
from src.agents.agents import run_sequential_pipeline, run_parallel_pipeline

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    parser = argparse.ArgumentParser(description="DevPulse News Pipeline")
    parser.add_argument(
        '--pipeline',
        type=str,
        choices=['sequential', 'parallel'],
        default='sequential',
        help='The type of pipeline to run (sequential or parallel)'
    )
    args = parser.parse_args()

    logging.info(f"Starting DevPulse News Pipeline (type: {args.pipeline})...")

    if args.pipeline == 'sequential':
        run_sequential_pipeline()
    else:
        run_parallel_pipeline()

    logging.info("DevPulse Pipeline finished successfully.")

if __name__ == "__main__":
    main()