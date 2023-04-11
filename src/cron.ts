import { z } from "zod";
import { CronJob } from "cron";
import type { Context, Provider } from "./providers";

const CronExpression = z.string().brand("cron");

export type CronExpression = z.infer<typeof CronExpression>;

export function cron(expression: string): CronExpression {
	return CronExpression.parse(expression);
}

export type ScheduleJobOptions = {
	callback: () => Promise<unknown>;
};

export function scheduleJob(
	expression: CronExpression,
	opts: ScheduleJobOptions,
): CronJob {
	return new CronJob(expression, opts.callback);
}

export type Task = {
	name: string;
	job: CronJob;
	callback: () => Promise<unknown>;
};

export function startJobs(
	ctx: Readonly<Context>,
	providers: Record<string, Provider<unknown>>,
): Task[] {
	return Object.values(providers).map((provider) => {
		console.log("[scheduler] Creating provider", provider.name);
		const callback = () => {
			console.log("[scheduler] Running job", provider.name);
			return provider.run(ctx);
		};
		const job = scheduleJob(provider.schedule, { callback });
		if (provider.debug) {
			console.log("[scheduler] Running job immediately", provider.name);
			callback();
		}
		job.start();
		return {
			job,
			name: provider.name,
			callback,
		};
	});
}
