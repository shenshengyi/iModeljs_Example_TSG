/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  BasicNavigationWidget,
  BasicToolWidget,
  ContentGroup,
  ContentGroupProps,
  ContentLayoutDef,
  ContentLayoutProps,
  CoreTools,
  Frontstage,
  FrontstageProps,
  FrontstageProvider,
  IModelViewportControl,
  UiFramework,
  Widget,
  Zone,
  StatusBarItemUtilities,
  withStatusFieldProps,
  withMessageCenterFieldProps,
  SnapModeField,
  ActivityCenterField,
  FooterModeField,
  ToolAssistanceField,
  StatusBarItem,
  StatusBarWidgetControl,
  StatusBarWidgetControlArgs,
  StatusBarComposer,
  ConfigurableUiManager,
  MessageCenterField,
  WidgetContent,
  WidgetControl,
  ConfigurableCreateInfo,
  ZoneState,
  ContentControl,
} from "@bentley/ui-framework";
import { StageUsage, StatusBarSection } from "@bentley/ui-abstract";
import "./index.scss";
import { FooterSeparator } from "@bentley/ui-ninezone";
import {
  UnderlinedButton,
  Button,
  ButtonType,
  ButtonSize,
} from "@bentley/ui-core";

// These react components are used to organize each of the component examples, as well as their names and descriptions

// The component container takes in several sets of example properties(component title, description, and actual component), and displays all of them as a list
export class ComponentContainer extends React.Component<{
  data: ComponentExampleProps[];
}> {
  public render() {
    return (
      <div id="component-container" className="component-container">
        {this.props.data.map(
          (exampleProps: ComponentExampleProps, index: number) => {
            return (
              <ComponentExample
                key={index.toString()}
                title={exampleProps.title}
                description={exampleProps.description}
                content={exampleProps.content}
              />
            );
          }
        )}
      </div>
    );
  }
}

// These are the possible attributes of each of the components being displayed
export interface ComponentExampleProps {
  title: string;
  description?: string;
  content: React.ReactNode;
}

// This formats a single component, along with its corresponding title and description, and adds them to the DOM
// tslint:disable-next-line:variable-name
export const ComponentExample: React.FC<ComponentExampleProps> = (
  props: ComponentExampleProps
) => {
  const { title, description, content } = props;
  return (
    <div className="component-example-container">
      <div className="panel left-panel">
        <span className="title">{title}</span>
        <span className="description">{description}</span>
      </div>
      <div className="panel right-panel">{content}</div>
    </div>
  );
};

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (
  title: string,
  description: string | undefined,
  content: React.ReactNode
): ComponentExampleProps => {
  return { title, description, content };
};

class ButtonList extends React.Component {
  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getButtonData(): ComponentExampleProps[] {
    return [
      createComponentExample(
        "基本按钮",
        "主按钮",
        <Button>Primary Button</Button>
      ),
      createComponentExample(
        "禁用按钮",
        "带有禁用属性的按钮",
        <Button disabled>禁用按钮</Button>
      ),
      createComponentExample(
        "蓝色按钮",
        "具有ButtonType.Blue的按钮",
        <Button buttonType={ButtonType.Blue}>蓝色按钮</Button>
      ),
      createComponentExample(
        "空心按钮",
        "具有ButtonType.Hollow的按钮",
        <Button buttonType={ButtonType.Hollow}>Hollow Button</Button>
      ),
      createComponentExample(
        "大号基本按钮",
        "Primary Button with size={ButtonSize.Large}",
        <Button size={ButtonSize.Large}>Primary Button</Button>
      ),
      createComponentExample(
        "大号禁用按钮",
        "Button with disabled and size={ButtonSize.Large} props",
        <Button disabled size={ButtonSize.Large}>
          Disabled Button
        </Button>
      ),
      createComponentExample(
        "Large Blue Button",
        "Button with ButtonType.Blue and size={ButtonSize.Large}",
        <Button buttonType={ButtonType.Blue} size={ButtonSize.Large}>
          Blue Button
        </Button>
      ),
      createComponentExample(
        "Large Hollow Button",
        "Button with ButtonType.Hollow and size={ButtonSize.Large}",
        <Button buttonType={ButtonType.Hollow} size={ButtonSize.Large}>
          Hollow Button
        </Button>
      ),
      createComponentExample(
        "带下划线的按钮",
        "带下划线的按钮",
        <UnderlinedButton>带下划线的按钮</UnderlinedButton>
      ),
    ];
  }

  public static setup() {
    return <ButtonList></ButtonList>;
    // return <div>hello,NBA</div>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ComponentContainer
          data={ButtonList.getButtonData()}
        ></ComponentContainer>
      </>
    );
  }
}
export class ButtonContent extends ContentControl {
  public static ID = "MY_TableContent11";
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);

    if (options.iModelConnection) {
      this.reactNode = this.reactNode = ButtonList.setup();
    }
  }
}
ConfigurableUiManager.registerControl(ButtonContent.ID, ButtonContent);
// A content layout sets the number and arrangement of content views in a frontstage
const sampleContentLayout: ContentLayoutProps = {
  id: ButtonContent.ID,
};
const sampleLayoutDef: ContentLayoutDef = new ContentLayoutDef(
  sampleContentLayout
);

// a ContentGroup defines the content views in a frontstage
const sampleViewportGroupProps: ContentGroupProps = {
  id: "sampleViewportGroup",
  contents: [
    {
      classId: ButtonContent.ID,
      id: "sampleIModelView",
      applicationData: {
        viewState: UiFramework.getDefaultViewState,
        iModelConnection: UiFramework.getIModelConnection,
      }, // Options passed to the ContentControl component
    },
  ],
};
const sampleViewportGroup: ContentGroup = new ContentGroup(
  sampleViewportGroupProps
);
/**
 * Viewport Frontstage for AppUi samples
 */
export class UIViewportFrontstage extends FrontstageProvider {
  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {
    return (
      <Frontstage
        id="UIViewportFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={sampleLayoutDef}
        contentGroup={sampleViewportGroup}
        isInFooterMode={true}
        usage={StageUsage.General}
        applicationData={{ key: "value" }}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<BasicToolWidget />} />,
            ]}
          />
        }
        toolSettings={<Zone widgets={[<Widget isToolSettings={true} />]} />}
        viewNavigationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<BasicNavigationWidget />} />,
            ]}
          />
        }
        centerRight={
          <Zone
            defaultState={ZoneState.Minimized}
            allowsMerging={true}
            widgets={[
              <Widget
                control={ButtonWidget}
                fillZone={true}
                iconSpec="icon-tree"
                labelKey="NineZoneSample:components.tree"
              />,
            ]}
          />
        }
        statusBar={
          <Zone
            widgets={[
              <Widget
                isStatusBar={true}
                control={SmallStatusBarWidgetControl}
              />,
            ]}
          />
        }
      />
    );
  }
}

class ButtonWidget extends WidgetControl {
  constructor(info: ConfigurableCreateInfo, options: any) {
    super(info, options);
    this.reactNode = ButtonList.setup();
  }
}

export class SmallStatusBarWidgetControl extends StatusBarWidgetControl {
  private _statusBarItems: StatusBarItem[] | undefined;

  private get statusBarItems(): StatusBarItem[] {
    // tslint:disable-next-line: variable-name
    const ToolAssistance = withStatusFieldProps(ToolAssistanceField);
    // tslint:disable-next-line: variable-name
    const MessageCenter = withMessageCenterFieldProps(MessageCenterField);
    // tslint:disable-next-line: variable-name
    const SnapMode = withMessageCenterFieldProps(SnapModeField);
    // tslint:disable-next-line: variable-name
    const ActivityCenter = withStatusFieldProps(ActivityCenterField);
    // tslint:disable-next-line: variable-name
    const FooterMode = withStatusFieldProps(FooterModeField);

    if (!this._statusBarItems) {
      this._statusBarItems = [
        StatusBarItemUtilities.createStatusBarItem(
          "ToolAssistance",
          StatusBarSection.Left,
          10,
          <ToolAssistance />
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "ToolAssistanceSeparator",
          StatusBarSection.Left,
          15,
          <FooterMode>
            {" "}
            <FooterSeparator />{" "}
          </FooterMode>
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "MessageCenter",
          StatusBarSection.Left,
          20,
          <MessageCenter />
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "MessageCenterSeparator",
          StatusBarSection.Left,
          25,
          <FooterMode>
            {" "}
            <FooterSeparator />{" "}
          </FooterMode>
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "ActivityCenter",
          StatusBarSection.Left,
          30,
          <ActivityCenter />
        ),
        StatusBarItemUtilities.createStatusBarItem(
          "SnapMode",
          StatusBarSection.Center,
          10,
          <SnapMode />
        ),
      ];
    }
    return this._statusBarItems;
  }

  public getReactNode(_args: StatusBarWidgetControlArgs): React.ReactNode {
    return <StatusBarComposer items={this.statusBarItems} />;
  }
}

ConfigurableUiManager.registerControl(
  "SmallStatusBar",
  SmallStatusBarWidgetControl
);
