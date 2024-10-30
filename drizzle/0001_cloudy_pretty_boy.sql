CREATE TABLE IF NOT EXISTS "alswap_transaction_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"txId" varchar(256) NOT NULL,
	"from" varchar(256) NOT NULL,
	"to" varchar(256) NOT NULL,
	"amount" varchar(256) NOT NULL,
	"status" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
