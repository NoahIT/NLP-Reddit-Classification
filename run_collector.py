"""
Reddit Data Collector - Entry Point
"""

import argparse
import sys
from app.data_collection import collector

def main():
    """
    Main function to parse arguments and start the correct collector.
    """
    parser = argparse.ArgumentParser(description="Reddit Sentiment Analysis Collector")
    subparsers = parser.add_subparsers(dest='command', required=True,
                                       help="The collection mode to run.")

    stream_parser = subparsers.add_parser('stream', help="Stream new items from a subreddit.")
    stream_parser.add_argument(
        '-s', '--subreddit', 
        type=str, 
        required=True,
        help="The name of the subreddit to stream (e.g., 'python')."
    )
    stream_parser.add_argument(
        '-t', '--type',
        type=str,
        choices=['comment', 'post'],
        default='comment',
        help="The type of item to stream: 'comment' (default) or 'post'."
    )
    stream_parser.add_argument(
        '-b', '--batch_size',
        type=int,
        default=50,
        help="Number of items to batch before inserting into DB (default: 50)."
    )

    poll_parser = subparsers.add_parser('poll', help="Poll for keywords across subreddits.")
    poll_parser.add_argument(
        '-k', '--keywords',
        nargs='+',
        required=True,
        help="A list of keywords to search for (e.g., 'tesla' 'ai')."
    )
    poll_parser.add_argument(
        '-s', '--subreddits',
        nargs='+',
        default=['all'],
        help="A list of subreddits to search in (default: 'all')."
    )
    poll_parser.add_argument(
        '-i', '--interval',
        type=int,
        default=300,
        help="Time (in seconds) between polling intervals (default: 300s)."
    )
    poll_parser.add_argument(
        '-b', '--batch_size',
        type=int,
        default=50,
        help="Number of items to batch per poll cycle (default: 50)."
    )
    
    args = parser.parse_args()

    try:
        print("Initializing PRAW...")
        reddit = collector.get_reddit_instance()
        print("PRAW initialized.")

        if args.command == 'stream':
            print(f"Starting 'stream' mode for r/{args.subreddit} ({args.type}s)...")
            collector.process_stream(
                reddit=reddit,
                subreddit_name=args.subreddit,
                item_type=args.type,
                batch_size=args.batch_size
            )

        elif args.command == 'poll':
            print(f"Starting 'poll' mode...")
            collector.poll_keywords(
                reddit=reddit,
                keywords=args.keywords,
                subreddits=args.subreddits,
                poll_interval=args.interval,
                batch_size=args.batch_size
            )
            
    except KeyboardInterrupt:
        print("\nCollector stopped by user. Exiting.")
        sys.exit(0)
    except Exception as e:
        print(f"\nA critical error occurred: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()