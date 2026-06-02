import { createBrowserRouter } from "react-router";
import { Layout } from "../components/Layout";
import { Dashboard } from "../components/Dashboard";
import { Customers } from "../components/Customers";
import { CampaignPage } from "../components/Campaign";
import { CouponPage } from "../components/Coupon";
import { FeedbackAnalysis } from "../components/FeedbackAnalysis";
import { PurchaseAnalysis } from "../components/PurchaseAnalysis";
import { UserBehavior } from "../components/UserBehavior";
import { CodeManagement } from "../components/CodeManagement";
import { AnonymousUsersPage } from "../components/AnonymousUsers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "customers", Component: Customers },
      { path: "campaign", Component: CampaignPage },
      { path: "codes", Component: CodeManagement },
      { path: "coupon", Component: CouponPage },
      { path: "feedback", Component: FeedbackAnalysis },
      { path: "purchase", Component: PurchaseAnalysis },
      { path: "behavior", Component: UserBehavior },
      { path: "anonymous-users", Component: AnonymousUsersPage },
    ],
  },
], { basename: '/admin' });
