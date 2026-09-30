---
description: A Nest DI resolution error must be diagnosed from the module wiring - PaymentsClient is provided but not exported by PaymentsModule - with the minimal fix.
tags: [smoke, nestjs, debug-node]
max_turns: 25
timeout_seconds: 400
# node-mentor depends on engineering-mentor; eval runs load nothing else, so load both.
# Run scripts/prepare-evals.sh first to copy it into .eval-deps/.
plugins: ["../..", "../../.eval-deps/engineering-mentor"]
allowed_tools: [Read, Glob, Grep, Skill]
---

The app won't start after I injected PaymentsClient into OrdersService:

```
[Nest] ERROR [ExceptionHandler] Nest can't resolve dependencies of the OrdersService (Repository<Order>, ?). Please make sure that the argument PaymentsClient at index [1] is available in the OrdersModule context.
```

What's wrong and what's the fix? Don't edit files, just tell me.
