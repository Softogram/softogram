# Here are your Instructions


You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
pricing-card.tsx
import * as React from 'react';
import { cn } from "@/lib/utils"; // Assuming a utility function for class merging
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

// --- 1. Typescript Interfaces (API) ---

type BillingCycle = 'monthly' | 'annually';

interface Feature {
  name: string;
  isIncluded: boolean;
  tooltip?: string;
}

interface PriceTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceAnnually: number;
  isPopular: boolean;
  buttonLabel: string;
  features: Feature[];
}

interface PricingComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The list of pricing tiers to display. Must contain exactly 3 tiers. */
  plans: [PriceTier, PriceTier, PriceTier];
  /** The currently selected billing cycle. */
  billingCycle: BillingCycle;
  /** Callback function when the user changes the billing cycle. */
  onCycleChange: (cycle: BillingCycle) => void;
  /** Callback function when a user selects a plan. */
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
}

// --- 2. Utility Components ---

/** Renders a single feature row with an icon. */
const FeatureItem: React.FC<{ feature: Feature }> = ({ feature }) => {
  const Icon = feature.isIncluded ? Check : X;
  const iconColor = feature.isIncluded ? "text-primary" : "text-muted-foreground";

  return (
    <li className="flex items-start space-x-3 py-2">
      <Icon className={cn("h-4 w-4 flex-shrink-0 mt-0.5", iconColor)} aria-hidden="true" />
      <span className={cn("text-sm", feature.isIncluded ? "text-foreground" : "text-muted-foreground")}>
        {feature.name}
      </span>
    </li>
  );
};

// --- 3. Main Component: PricingComponent ---

const PricingComponent: React.FC<PricingComponentProps> = ({
  plans,
  billingCycle,
  onCycleChange,
  onPlanSelect,
  className,
  ...props
}) => {
  // Ensure exactly 3 plans are passed for the intended layout
  if (plans.length !== 3) {
    console.error("PricingComponent requires exactly 3 pricing tiers.");
    return null;
  }

  const annualDiscountPercent = 20; // Example: 20% discount for annual billing

  // --- 3.1. Billing Toggle ---
  const CycleToggle = (
    <div className="flex justify-center mb-10 mt-2">
      <ToggleGroup
        type="single"
        value={billingCycle}
        onValueChange={(value) => {
          if (value && (value === 'monthly' || value === 'annually')) {
            onCycleChange(value);
          }
        }}
        aria-label="Select billing cycle"
        className="border rounded-lg p-1 bg-muted/50 dark:bg-muted/30"
      >
        <ToggleGroupItem
          value="monthly"
          aria-label="Monthly Billing"
          className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors"
        >
          Monthly
        </ToggleGroupItem>
        <ToggleGroupItem
          value="annually"
          aria-label="Annual Billing"
          className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors relative"
        >
          Annually
          <span className="absolute -top-3 right-0 text-xs font-semibold text-primary/80 dark:text-primary/70 bg-primary/10 dark:bg-primary/20 px-1.5 rounded-full whitespace-nowrap">
            Save {annualDiscountPercent}%
          </span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );

  // --- 3.2. Pricing Cards & Comparison Table Data ---

  // Extract all unique feature names across all plans for the comparison table header
  const allFeatures = Array.from(new Set(plans.flatMap(p => p.features.map(f => f.name))));
  
  // Render the list of pricing cards
  const PricingCards = (
    <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
      {plans.map((plan) => {
        const isFeatured = plan.isPopular;
        const currentPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnually;
        const originalMonthlyPrice = plan.priceMonthly;
        const priceSuffix = billingCycle === 'monthly' ? '/mo' : '/yr';

        return (
          <Card
            key={plan.id}
            className={cn(
              "flex flex-col transition-all duration-300 shadow-md hover:shadow-lg dark:hover:shadow-white/10",
              isFeatured && "ring-2 ring-primary dark:ring-primary/80 shadow-xl dark:shadow-primary/20 transform md:scale-[1.02] hover:scale-[1.04]"
            )}
          >
            <CardHeader className="p-6 pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                {isFeatured && (
                  <span className="text-xs font-semibold px-3 py-1 bg-primary text-primary-foreground rounded-full">
                    Most Popular
                  </span>
                )}
              </div>
              <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
              <div className="mt-4">
                <p className="text-4xl font-extrabold text-foreground">
                  ${currentPrice}
                  <span className="text-base font-normal text-muted-foreground ml-1">{priceSuffix}</span>
                </p>
                {billingCycle === 'annually' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed annually (${plan.priceAnnually})
                  </p>
                )}
                {billingCycle === 'annually' && (
                    <p className="text-xs text-muted-foreground line-through opacity-70 mt-1">
                        ${originalMonthlyPrice}/mo
                    </p>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-6 pt-0">
              <h4 className="text-sm font-semibold mb-2 mt-4 text-foreground/80">Key Features:</h4>
              <ul className="list-none space-y-0">
                {plan.features.slice(0, 5).map((feature) => (
                  <FeatureItem key={feature.name} feature={feature} />
                ))}
                {plan.features.length > 5 && (
                    <li className="text-sm text-muted-foreground mt-2">
                        + {plan.features.length - 5} more features
                    </li>
                )}
              </ul>
            </CardContent>
            <CardFooter className="p-6 pt-0">
              <Button
                onClick={() => onPlanSelect(plan.id, billingCycle)}
                className={cn(
                  "w-full transition-all duration-200",
                  isFeatured
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 dark:shadow-primary/40"
                    : "bg-muted text-foreground hover:bg-muted/80 border border-input"
                )}
                size="lg"
                aria-label={`Select ${plan.name} plan for ${currentPrice} ${priceSuffix}`}
              >
                {plan.buttonLabel}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  // --- 3.3. Comparison Table (Mobile hidden, Tablet/Desktop visible) ---
  const ComparisonTable = (
    <div className="mt-16 hidden md:block border rounded-lg overflow-x-auto shadow-sm dark:border-border/50">
      <table className="min-w-full divide-y divide-border/80 dark:divide-border/50">
        <thead>
          <tr className="bg-muted/30 dark:bg-muted/20">
            <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 w-[200px] whitespace-nowrap">
              Feature
            </th>
            {plans.map((plan) => (
              <th
                key={`th-${plan.id}`}
                scope="col"
                className={cn(
                  "px-6 py-4 text-center text-sm font-semibold text-foreground/80 whitespace-nowrap",
                  plan.isPopular && "bg-primary/10 dark:bg-primary/20"
                )}
              >
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/80 dark:divide-border/50 bg-background/90">
          {allFeatures.map((featureName, index) => (
            <tr key={featureName} className={cn("transition-colors hover:bg-accent/20 dark:hover:bg-accent/10", index % 2 === 0 ? "bg-background" : "bg-muted/10 dark:bg-muted/5")}>
              <td className="px-6 py-3 text-left text-sm font-medium text-foreground/90 whitespace-nowrap">
                {featureName}
              </td>
              {plans.map((plan) => {
                const feature = plan.features.find(f => f.name === featureName);
                const isIncluded = feature?.isIncluded ?? false;
                const Icon = isIncluded ? Check : X;
                const iconColor = isIncluded ? "text-primary" : "text-muted-foreground/70";

                return (
                  <td
                    key={`${plan.id}-${featureName}`}
                    className={cn(
                      "px-6 py-3 text-center transition-all duration-150",
                      plan.isPopular && "bg-primary/5 dark:bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 mx-auto", iconColor)} aria-hidden="true" />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // --- 3.4. Final Render ---
  return (
    <div className={cn("w-full py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", className)} {...props}>
      <header className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Choose the right plan for your business.
        </h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
          Scale effortlessly with features designed for growth, from startups to enterprise.
        </p>
      </header>
      
      {CycleToggle}
      
      {/* Pricing Cards (Mobile-first layout) */}
      <section aria-labelledby="pricing-plans">
        {PricingCards}
      </section>

      {/* Comparison Table (Desktop/Tablet visibility) */}
      <section aria-label="Feature Comparison Table" className="mt-16">
        <h3 className="text-2xl font-bold mb-6 hidden md:block text-center text-foreground">
          Detailed Feature Comparison
        </h3>
        {ComparisonTable}
      </section>
    </div>
  );
};




const examplePlans: [PriceTier, PriceTier, PriceTier] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for new teams and small projects.',
    priceMonthly: 19,
    priceAnnually: 182, // ~15.17/mo (20% discount from $19)
    isPopular: false,
    buttonLabel: 'Start Free Trial',
    features: [
      { name: '1 Project', isIncluded: true },
      { name: 'Basic Analytics', isIncluded: true },
      { name: 'Email Support', isIncluded: true },
      { name: '10,000 API Calls', isIncluded: true },
      { name: 'Custom Domains', isIncluded: false },
      { name: 'Dedicated Account Manager', isIncluded: false },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Everything a growing business needs to succeed.',
    priceMonthly: 49,
    priceAnnually: 470, // ~39.17/mo (20% discount from $49)
    isPopular: true,
    buttonLabel: 'Choose Pro',
    features: [
      { name: 'Unlimited Projects', isIncluded: true },
      { name: 'Advanced Analytics', isIncluded: true },
      { name: 'Priority Chat Support', isIncluded: true },
      { name: '500,000 API Calls', isIncluded: true },
      { name: 'Custom Domains', isIncluded: true },
      { name: 'SLAs and Uptime Guarantees', isIncluded: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Advanced features and dedicated support for large organizations.',
    priceMonthly: 199,
    priceAnnually: 1910, // ~159.17/mo (20% discount from $199)
    isPopular: false,
    buttonLabel: 'Contact Sales',
    features: [
      { name: 'Unlimited Projects', isIncluded: true },
      { name: 'Advanced Analytics', isIncluded: true },
      { name: 'Priority Chat Support', isIncluded: true },
      { name: '5,000,000 API Calls', isIncluded: true },
      { name: 'Custom Domains', isIncluded: true },
      { name: 'Dedicated Account Manager', isIncluded: true },
      { name: 'SLAs and Uptime Guarantees', isIncluded: true },
      { name: 'Single Sign-On (SSO)', isIncluded: true },
    ],
  },
];

// Example React Component Usage
const ExampleComp = () => {
  const [cycle, setCycle] = React.useState<BillingCycle>('annually');

  const handleCycleChange = (newCycle: BillingCycle) => {
    setCycle(newCycle);
    console.log(`Billing cycle changed to: ${newCycle}`);
  };

  const handlePlanSelect = (planId: string, currentCycle: BillingCycle) => {
    console.log(`User selected plan: ${planId} with cycle: ${currentCycle}`);
    // Navigation or API call logic would go here
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PricingComponent
        plans={examplePlans}
        billingCycle={cycle}
        onCycleChange={handleCycleChange}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
};


export default ExampleComp

demo.tsx
import ExampleComp from "@/components/ui/pricing-card";

export default function DemoOne() {
  return <ExampleComp />;
}

```

Copy-paste these files for dependencies:
```tsx
shadcn/button
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

```
```tsx
shadcn/toggle-group
"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn("flex items-center justify-center gap-1", className)}
    {...props}
  >
    <ToggleGroupContext.Provider value={{ variant, size }}>
      {children}
    </ToggleGroupContext.Provider>
  </ToggleGroupPrimitive.Root>
))

ToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { ToggleGroup, ToggleGroupItem }

```
```tsx
shadcn/toggle
"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-3",
        sm: "h-9 px-2.5",
        lg: "h-11 px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }

```
```tsx
shadcn/card
import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className,
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }

```

Install NPM dependencies:
```bash
lucide-react, @radix-ui/react-slot, class-variance-authority, @radix-ui/react-toggle-group, @radix-ui/react-toggle
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

